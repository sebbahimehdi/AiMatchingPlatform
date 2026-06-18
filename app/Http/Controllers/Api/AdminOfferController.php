<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\InternshipOfferResource;
use App\Models\InternshipOffer;
use Illuminate\Http\JsonResponse;

class AdminOfferController extends Controller
{
    public function index(): JsonResponse
    {
        $offers = InternshipOffer::query()
            ->with(['company.user'])
            ->withCount('applications')
            ->latest()
            ->get();

        return response()->json([
            'data' => InternshipOfferResource::collection($offers),
        ]);
    }

    public function destroy(InternshipOffer $offer): JsonResponse
    {
        $offer->delete();

        return response()->json([
            'message' => 'Offer deleted successfully.',
        ]);
    }
}
