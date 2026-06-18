from __future__ import annotations

from collections.abc import Iterable
from io import BytesIO

from fastapi import FastAPI, File, UploadFile
from pydantic import BaseModel, Field

from .skills import extract_skills_from_text, normalize_skills, score_match

try:
    import fitz  # type: ignore
except ImportError:  # pragma: no cover
    fitz = None


class MatchRequest(BaseModel):
    student_skills: list[str] = Field(default_factory=list)
    offer_skills: list[str] = Field(default_factory=list)


class InternshipPayload(BaseModel):
    offer_id: int
    title: str
    required_skills: list[str] = Field(default_factory=list)


class RankingRequest(BaseModel):
    student_skills: list[str] = Field(default_factory=list)
    internships: list[InternshipPayload] = Field(default_factory=list)


app = FastAPI(title="AI Internship Matcher Service", version="1.0.0")


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/match")
def match(payload: MatchRequest) -> dict[str, object]:
    result = score_match(payload.student_skills, payload.offer_skills)

    return {
        "student_skills": normalize_skills(payload.student_skills),
        "offer_skills": normalize_skills(payload.offer_skills),
        **result,
    }


@app.post("/rank")
def rank(payload: RankingRequest) -> dict[str, list[dict[str, object]]]:
    ranked = []

    for internship in payload.internships:
        result = score_match(payload.student_skills, internship.required_skills)
        ranked.append(
            {
                "offer_id": internship.offer_id,
                "title": internship.title,
                **result,
            }
        )

    ranked.sort(key=lambda item: item["score"], reverse=True)

    return {"ranked_internships": ranked}


@app.post("/extract-skills")
async def extract_skills(file: UploadFile = File(...)) -> dict[str, object]:
    content = await file.read()
    text = extract_pdf_text(content)
    skills = extract_skills_from_text(text)

    return {
        "filename": file.filename,
        "skills": skills,
    }


def extract_pdf_text(content: bytes) -> str:
    if fitz is None:
        return ""

    document = fitz.open(stream=BytesIO(content), filetype="pdf")

    try:
        return "\n".join(page.get_text() for page in document)
    finally:
        document.close()


def score_student_against_offers(
    student_skills: Iterable[str],
    internships: Iterable[InternshipPayload],
) -> list[dict[str, object]]:
    request = RankingRequest(
        student_skills=list(student_skills),
        internships=list(internships),
    )

    return rank(request)["ranked_internships"]
