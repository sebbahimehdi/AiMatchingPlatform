<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipOfferResource;
use App\Models\InternshipOffer;
use App\Models\MatchScore;
use App\Services\Matching\MatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class RecommendationController extends Controller
{
    public function index(Request $request, MatchingService $matchingService): JsonResponse
    {
        $student = $request->user()->load('student')->student;
        $offers = InternshipOffer::query()
            ->with(['company.user'])
            ->latest()
            ->get();

        if ($offers->isEmpty()) {
            return response()->json([
                'data' => [],
            ]);
        }

        $rankings = collect($matchingService->rankOffersForStudent($student, $offers));
        $now = Carbon::now();

        MatchScore::query()->upsert(
            $rankings->map(fn (array $item) => [
                'student_id' => $student->id,
                'offer_id' => $item['offer_id'],
                'score' => $item['score'],
                'created_at' => $now,
                'updated_at' => $now,
            ])->all(),
            ['student_id', 'offer_id'],
            ['score', 'updated_at'],
        );

        $rankedOffers = $this->hydrateOfferScores($offers, $rankings);

        return response()->json([
            'data' => InternshipOfferResource::collection($rankedOffers),
        ]);
    }

    /**
     * @param  Collection<int, InternshipOffer>  $offers
     * @param  Collection<int, array{offer_id:int, score:float, matching_skills:array<int, string>}>  $rankings
     * @return Collection<int, InternshipOffer>
     */
    private function hydrateOfferScores(Collection $offers, Collection $rankings): Collection
    {
        $scoreMap = $rankings->keyBy('offer_id');

        return $offers
            ->map(function (InternshipOffer $offer) use ($scoreMap) {
                $ranking = $scoreMap->get($offer->id, [
                    'score' => 0,
                    'matching_skills' => [],
                ]);

                $offer->setAttribute('match_score', $ranking['score']);
                $offer->setAttribute('matching_skills', $ranking['matching_skills']);

                return $offer;
            })
            ->sortByDesc('match_score')
            ->values();
    }
}
