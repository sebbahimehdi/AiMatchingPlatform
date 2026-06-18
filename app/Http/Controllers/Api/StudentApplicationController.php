<?php

namespace App\Http\Controllers\Api;

use App\Enums\ApplicationStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Student\ApplyToOfferRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\InternshipApplication;
use App\Models\InternshipOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentApplicationController extends Controller
{
    public function apply(ApplyToOfferRequest $request): JsonResponse
    {
        $student = $request->user()->load('student')->student;
        $offerId = (int) $request->validated('offer_id');
        $alreadyApplied = InternshipApplication::query()
            ->where('student_id', $student->id)
            ->where('offer_id', $offerId)
            ->exists();

        if ($alreadyApplied) {
            return response()->json([
                'message' => 'You have already applied to this internship.',
            ], 422);
        }

        InternshipOffer::query()->findOrFail($offerId);

        $application = InternshipApplication::create([
            'student_id' => $student->id,
            'offer_id' => $offerId,
            'status' => ApplicationStatus::Pending->value,
        ])->load('offer.company');

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data' => new ApplicationResource($application),
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $student = $request->user()->load('student')->student;
        $applications = InternshipApplication::query()
            ->with(['offer.company.user'])
            ->where('student_id', $student->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => ApplicationResource::collection($applications),
        ]);
    }
}
