<?php

namespace App\Services\Matching;

use App\Models\InternshipOffer;
use App\Models\Student;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Throwable;

class MatchingService
{
    /**
     * @param  Collection<int, InternshipOffer>  $offers
     * @return array<int, array{offer_id:int, score:float, matching_skills:array<int, string>}>
     */
    public function rankOffersForStudent(Student $student, Collection $offers): array
    {
        $student->loadMissing('skillTags');
        $studentSkills = $this->normalizeSkills($student->skillNames());
        $payload = [
            'student_skills' => $studentSkills,
            'internships' => $offers->map(fn (InternshipOffer $offer) => [
                'offer_id' => $offer->id,
                'title' => $offer->title,
                'required_skills' => $offer->required_skills ?? [],
            ])->values()->all(),
        ];

        try {
            $response = Http::baseUrl(config('services.ai_matcher.url'))
                ->timeout((int) config('services.ai_matcher.timeout', 8))
                ->acceptJson()
                ->post('/rank', $payload)
                ->throw()
                ->json('ranked_internships');

            if (is_array($response)) {
                return array_values(array_map(
                    fn (array $item) => [
                        'offer_id' => (int) ($item['offer_id'] ?? 0),
                        'score' => round((float) ($item['score'] ?? 0), 2),
                        'matching_skills' => array_values($item['matching_skills'] ?? []),
                    ],
                    $response,
                ));
            }
        } catch (ConnectionException|Throwable) {
            // Fall back to a local deterministic scorer when the AI service is unavailable.
        }

        return $offers
            ->map(fn (InternshipOffer $offer) => $this->scoreOffer($studentSkills, $offer))
            ->sortByDesc('score')
            ->values()
            ->all();
    }

    /**
     * @return array<int, string>
     */
    public function extractSkillsFromCv(?UploadedFile $cv): array
    {
        if (! $cv || ! config('services.ai_matcher.enable_cv_extraction', true)) {
            return [];
        }

        try {
            $response = Http::baseUrl(config('services.ai_matcher.url'))
                ->timeout((int) config('services.ai_matcher.timeout', 8))
                ->attach(
                    'file',
                    file_get_contents($cv->getRealPath()) ?: '',
                    $cv->getClientOriginalName(),
                )
                ->post('/extract-skills')
                ->throw()
                ->json('skills');

            return $this->normalizeSkills(is_array($response) ? $response : []);
        } catch (ConnectionException|Throwable) {
            return [];
        }
    }

    /**
     * @param  array<int, string>  $studentSkills
     * @return array{offer_id:int, score:float, matching_skills:array<int, string>}
     */
    private function scoreOffer(array $studentSkills, InternshipOffer $offer): array
    {
        $requiredSkills = $this->normalizeSkills($offer->required_skills ?? []);
        $matchingSkills = array_values(array_intersect($requiredSkills, $studentSkills));
        $requiredCount = count($requiredSkills);
        $score = $requiredCount === 0 ? 0.0 : (count($matchingSkills) / $requiredCount) * 100;

        return [
            'offer_id' => $offer->id,
            'score' => round($score, 2),
            'matching_skills' => $matchingSkills,
        ];
    }

    /**
     * @param  array<int, string>  $skills
     * @return array<int, string>
     */
    private function normalizeSkills(array $skills): array
    {
        return array_values(array_unique(array_filter(array_map(
            fn ($skill) => strtolower(trim((string) $skill)),
            $skills,
        ))));
    }
}
