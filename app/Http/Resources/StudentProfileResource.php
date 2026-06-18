<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $student = $this->student;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'profile' => [
                'student_id' => $student?->id,
                'phone' => $student?->phone,
                'city' => $student?->city,
                'university' => $student?->university,
                'degree' => $student?->degree,
                'field_of_study' => $student?->field_of_study,
                'experience_title' => $student?->experience_title,
                'experience_description' => $student?->experience_description,
                'skills' => $student?->skillNames() ?? [],
                'cv_path' => $student?->cv_path,
                'cv_url' => $student?->cv_path ? asset('storage/'.$student->cv_path) : null,
                'preferred_technologies' => $student?->preferred_technologies ?? [],
                'internship_type' => $student?->internship_type,
                'preferred_location' => $student?->preferred_location,
            ],
        ];
    }
}
