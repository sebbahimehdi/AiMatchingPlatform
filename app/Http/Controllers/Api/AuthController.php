<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Company;
use App\Models\Skill;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::with(['student.skillTags', 'company'])->where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 422);
        }

        if ($user->is_banned) {
            return response()->json([
                'message' => 'Your account has been suspended.',
            ], 403);
        }

        $user->tokens()->delete();
        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'message' => 'Logged in successfully.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['student.skillTags', 'company']);

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($request, $validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'role' => $validated['role'],
            ]);

            if ($validated['role'] === UserRole::Student->value) {
                $cvPath = $request->hasFile('cv')
                    ? $request->file('cv')->store('cvs', 'public')
                    : null;

                $student = Student::create([
                    'user_id' => $user->id,
                    'phone' => $validated['phone'] ?? null,
                    'city' => $validated['city'] ?? null,
                    'university' => $validated['university'] ?? null,
                    'degree' => $validated['degree'] ?? null,
                    'field_of_study' => $validated['field_of_study'] ?? null,
                    'experience_title' => $validated['experience_title'] ?? null,
                    'experience_description' => $validated['experience_description'] ?? null,
                    'skills' => $this->normalizeSkills($validated['skills'] ?? []),
                    'cv_path' => $cvPath,
                    'preferred_technologies' => $this->normalizeSkills($validated['preferred_technologies'] ?? $validated['technologies'] ?? []),
                    'internship_type' => $validated['internship_type'] ?? null,
                    'preferred_location' => $validated['preferred_location'] ?? $validated['location'] ?? null,
                ]);

                $this->syncStudentSkills($student, $validated['skills'] ?? []);
            }

            if ($validated['role'] === UserRole::Company->value) {
                Company::create([
                    'user_id' => $user->id,
                    'company_name' => $validated['company_name'],
                    'description' => $validated['description'] ?? null,
                ]);
            }

            return $user->load(['student.skillTags', 'company']);
        });

        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $token,
            'user' => $this->formatUser($user),
        ], 201);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_banned' => $user->is_banned,
            'student' => $user->student ? [
                'id' => $user->student->id,
                'phone' => $user->student->phone,
                'city' => $user->student->city,
                'university' => $user->student->university,
                'degree' => $user->student->degree,
                'field_of_study' => $user->student->field_of_study,
                'experience_title' => $user->student->experience_title,
                'experience_description' => $user->student->experience_description,
                'skills' => $user->student->skillNames(),
                'cv_url' => $user->student->cv_path
                    ? asset('storage/'.$user->student->cv_path)
                    : null,
                'preferred_technologies' => $user->student->preferred_technologies ?? [],
                'internship_type' => $user->student->internship_type,
                'preferred_location' => $user->student->preferred_location,
            ] : null,
            'company' => $user->company ? [
                'id' => $user->company->id,
                'company_name' => $user->company->company_name,
                'description' => $user->company->description,
            ] : null,
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

    /**
     * @param  array<int, string>  $skills
     */
    private function syncStudentSkills(Student $student, array $skills): void
    {
        $skillIds = collect($this->normalizeSkills($skills))
            ->map(fn (string $name) => Skill::firstOrCreate(['name' => $name])->id)
            ->all();

        $student->skillTags()->sync($skillIds);
    }
}
