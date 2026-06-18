<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\StoreInternshipOfferRequest;
use App\Http\Requests\Company\UpdateInternshipOfferRequest;
use App\Http\Resources\InternshipOfferResource;
use App\Models\InternshipOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyOfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $company = $request->user()->load('company')->company;
        $offers = InternshipOffer::query()
            ->with(['company.user'])
            ->withCount('applications')
            ->where('company_id', $company->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => InternshipOfferResource::collection($offers),
        ]);
    }

    public function publicIndex(): JsonResponse
    {
        $offers = InternshipOffer::query()
            ->with(['company.user'])
            ->latest()
            ->get();

        return response()->json([
            'data' => InternshipOfferResource::collection($offers),
        ]);
    }

    public function store(StoreInternshipOfferRequest $request): JsonResponse
    {
        $company = $request->user()->load('company')->company;
        $validated = $request->validated();
        $offer = InternshipOffer::create([
            'company_id' => $company->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $validated['location'],
            'internship_type' => $validated['internship_type'],
            'required_skills' => $this->normalizeSkills($validated['required_skills']),
        ])->load(['company.user']);

        return response()->json([
            'message' => 'Internship offer created successfully.',
            'data' => new InternshipOfferResource($offer),
        ], 201);
    }

    public function update(UpdateInternshipOfferRequest $request, InternshipOffer $offer): JsonResponse
    {
        $this->abortIfUnauthorized($request, $offer);
        $validated = $request->validated();

        if (array_key_exists('title', $validated)) {
            $offer->title = $validated['title'];
        }

        if (array_key_exists('description', $validated)) {
            $offer->description = $validated['description'];
        }

        if (array_key_exists('location', $validated)) {
            $offer->location = $validated['location'];
        }

        if (array_key_exists('internship_type', $validated)) {
            $offer->internship_type = $validated['internship_type'];
        }

        if (array_key_exists('required_skills', $validated)) {
            $offer->required_skills = $this->normalizeSkills($validated['required_skills']);
        }

        $offer->save();

        return response()->json([
            'message' => 'Internship offer updated successfully.',
            'data' => new InternshipOfferResource($offer->fresh()->load('company.user')),
        ]);
    }

    public function destroy(Request $request, InternshipOffer $offer): JsonResponse
    {
        $this->abortIfUnauthorized($request, $offer);
        $offer->delete();

        return response()->json([
            'message' => 'Internship offer deleted successfully.',
        ]);
    }

    private function abortIfUnauthorized(Request $request, InternshipOffer $offer): void
    {
        if ($request->user()->company?->id !== $offer->company_id) {
            abort(403, 'You do not own this offer.');
        }
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
