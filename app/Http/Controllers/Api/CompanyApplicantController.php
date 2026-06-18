<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\InternshipApplication;
use App\Models\InternshipOffer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CompanyApplicantController extends Controller
{
    public function index(Request $request, InternshipOffer $offer): JsonResponse
    {
        $this->abortIfUnauthorized($request, $offer);

        $applications = InternshipApplication::query()
            ->with(['student.user', 'offer.company'])
            ->where('offer_id', $offer->id)
            ->latest()
            ->get();

        return response()->json([
            'data' => ApplicationResource::collection($applications),
        ]);
    }

    public function update(
        UpdateApplicationStatusRequest $request,
        InternshipOffer $offer,
        InternshipApplication $application,
    ): JsonResponse {
        $this->abortIfUnauthorized($request, $offer);

        if ($application->offer_id !== $offer->id) {
            return response()->json([
                'message' => 'The application does not belong to this offer.',
            ], 422);
        }

        $application->update([
            'status' => $request->validated('status'),
        ]);

        return response()->json([
            'message' => 'Application status updated successfully.',
            'data' => new ApplicationResource($application->fresh()->load(['student.user', 'offer.company'])),
        ]);
    }

    public function cv(Request $request, InternshipOffer $offer, InternshipApplication $application): StreamedResponse|JsonResponse
    {
        $this->abortIfUnauthorized($request, $offer);

        if ($application->offer_id !== $offer->id) {
            return response()->json([
                'message' => 'The application does not belong to this offer.',
            ], 422);
        }

        $application->loadMissing('student.user');
        $path = $application->student?->cv_path;

        if (! $path || ! Storage::disk('public')->exists($path)) {
            return response()->json([
                'message' => 'CV file not found.',
            ], 404);
        }

        $studentName = str($application->student?->user?->name ?? 'student')
            ->slug()
            ->value();

        return Storage::disk('public')->response($path, "{$studentName}-cv.pdf", [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$studentName.'-cv.pdf"',
        ]);
    }

    private function abortIfUnauthorized(Request $request, InternshipOffer $offer): void
    {
        if ($request->user()->company?->id !== $offer->company_id) {
            abort(403, 'You do not own this offer.');
        }
    }
}
