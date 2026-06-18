<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Company\UpdateCompanyProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => [
                    'id' => $user->company?->id,
                    'company_name' => $user->company?->company_name,
                    'description' => $user->company?->description,
                ],
            ],
        ]);
    }

    public function update(UpdateCompanyProfileRequest $request): JsonResponse
    {
        $user = $request->user()->load('company');
        $validated = $request->validated();

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }

        $user->company->update([
            'company_name' => $validated['company_name'],
            'description' => $validated['description'] ?? null,
        ]);

        $user->save();

        return response()->json([
            'message' => 'Company profile updated successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->fresh()->name,
                'email' => $user->fresh()->email,
                'company' => $user->fresh()->load('company')->company,
            ],
        ]);
    }
}
