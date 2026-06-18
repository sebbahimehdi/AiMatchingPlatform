from __future__ import annotations

from collections.abc import Iterable
import re

KNOWN_SKILLS = {
    "agile",
    "angular",
    "aws",
    "azure",
    "c",
    "c#",
    "c++",
    "computer vision",
    "css",
    "data analysis",
    "data engineering",
    "django",
    "docker",
    "express",
    "fastapi",
    "figma",
    "flask",
    "git",
    "github actions",
    "golang",
    "html",
    "java",
    "javascript",
    "jira",
    "keras",
    "kotlin",
    "kubernetes",
    "laravel",
    "linux",
    "machine learning",
    "mongodb",
    "mysql",
    "next.js",
    "node.js",
    "numpy",
    "pandas",
    "php",
    "postgresql",
    "power bi",
    "problem solving",
    "product design",
    "project management",
    "pytorch",
    "python",
    "react",
    "redis",
    "rest api",
    "scikit-learn",
    "scrum",
    "sql",
    "spring boot",
    "tailwind",
    "tensorflow",
    "typescript",
    "ui/ux",
    "vue",
}


def normalize_skills(skills: Iterable[str]) -> list[str]:
    return sorted({skill.strip().lower() for skill in skills if str(skill).strip()})


def extract_skills_from_text(text: str) -> list[str]:
    haystack = text.lower()
    matches = []

    for skill in KNOWN_SKILLS:
        pattern = re.escape(skill).replace("\\ ", r"\s+")

        if re.search(rf"\b{pattern}\b", haystack):
            matches.append(skill)

    return normalize_skills(matches)


def score_match(student_skills: Iterable[str], required_skills: Iterable[str]) -> dict[str, object]:
    student = set(normalize_skills(student_skills))
    required = normalize_skills(required_skills)
    matching = sorted(student.intersection(required))
    required_count = len(required)
    score = 0.0 if required_count == 0 else round((len(matching) / required_count) * 100, 2)

    return {
        "matching_skills": matching,
        "score": score,
    }
