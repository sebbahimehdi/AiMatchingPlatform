<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Student\UpdateStudentProfileRequest;
use App\Http\Resources\StudentProfileResource;
use App\Models\Skill;
use App\Services\Matching\MatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentProfileController extends Controller
{
    public function show(Request $request): StudentProfileResource
    {
        return new StudentProfileResource($request->user()->load('student.skillTags'));
    }

    public function update(
        UpdateStudentProfileRequest $request,
        MatchingService $matchingService,
    ): JsonResponse {
        $user = $request->user()->load('student');
        $student = $user->student;
        $validated = $request->validated();
        $newSkills = $request->has('skills') ? $this->normalizeSkills($validated['skills'] ?? []) : $student->skillNames();

        if ($request->hasFile('cv')) {
            $path = $request->file('cv')->store('cvs', 'public');
            $extractedSkills = $matchingService->extractSkillsFromCv($request->file('cv'));

            $student->cv_path = $path;
            $newSkills = $this->normalizeSkills(array_merge($newSkills, $extractedSkills));
        }

        if (array_key_exists('name', $validated)) {
            $user->name = $validated['name'];
        }

        if (array_key_exists('email', $validated)) {
            $user->email = $validated['email'];
        }

        foreach ([
            'phone',
            'city',
            'university',
            'degree',
            'field_of_study',
            'experience_title',
            'experience_description',
            'internship_type',
            'preferred_location',
        ] as $field) {
            if (array_key_exists($field, $validated)) {
                $value = $validated[$field];

                if ($value !== null && trim((string) $value) !== '') {
                    $student->{$field} = $value;
                }
            }
        }

        if (array_key_exists('preferred_technologies', $validated)) {
            $student->preferred_technologies = $this->normalizeSkills($validated['preferred_technologies'] ?? []);
        }

        $student->skills = $newSkills;
        $student->save();
        $this->syncStudentSkills($student, $newSkills);
        $user->save();

        return response()->json([
            'message' => 'Student profile updated successfully.',
            'data' => new StudentProfileResource($user->fresh()->load('student.skillTags')),
        ]);
    }

    public function updateSkills(UpdateStudentProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $student = $request->user()->student;
        $skills = $this->normalizeSkills($validated['skills'] ?? []);

        $student->skills = $skills;
        $student->save();
        $this->syncStudentSkills($student, $skills);

        return response()->json([
            'message' => 'Student skills updated successfully.',
            'skills' => $skills,
        ]);
    }

    public function uploadCv(UpdateStudentProfileRequest $request, MatchingService $matchingService): JsonResponse
    {
        $validated = $request->validated();
        $student = $request->user()->student;

        if (! $request->hasFile('cv')) {
            return response()->json([
                'message' => 'Please attach a PDF CV.',
            ], 422);
        }

        $student->cv_path = $request->file('cv')->store('cvs', 'public');
        $skills = $this->normalizeSkills(array_merge(
            $student->skillNames(),
            $matchingService->extractSkillsFromCv($request->file('cv')),
            $validated['skills'] ?? [],
        ));
        $student->skills = $skills;
        $student->save();
        $this->syncStudentSkills($student, $skills);

        return response()->json([
            'message' => 'CV uploaded successfully.',
            'data' => new StudentProfileResource($request->user()->fresh()->load('student.skillTags')),
        ]);
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
    private function syncStudentSkills($student, array $skills): void
    {
        $skillIds = collect($this->normalizeSkills($skills))
            ->map(fn (string $name) => Skill::firstOrCreate(['name' => $name])->id)
            ->all();

        $student->skillTags()->sync($skillIds);
    }
}
