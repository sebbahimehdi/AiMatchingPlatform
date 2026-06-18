<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
            'offer' => [
                'id' => $this->offer?->id,
                'title' => $this->offer?->title,
                'company_name' => $this->offer?->company?->company_name,
                'location' => $this->offer?->location,
                'internship_type' => $this->offer?->internship_type,
            ],
            'student' => $this->when(
                $this->relationLoaded('student') && $this->student,
                fn () => [
                    'id' => $this->student?->id,
                    'name' => $this->student?->user?->name,
                    'email' => $this->student?->user?->email,
                    'skills' => $this->student?->skills ?? [],
                    'cv_path' => $this->student?->cv_path,
                    'cv_url' => $this->student?->cv_path
                        ? asset('storage/'.$this->student->cv_path)
                        : null,
                    'cv_download_url' => $this->student?->cv_path
                        ? route('company.applicants.cv', [$this->offer_id, $this->id])
                        : null,
                ],
            ),
        ];
    }
}
