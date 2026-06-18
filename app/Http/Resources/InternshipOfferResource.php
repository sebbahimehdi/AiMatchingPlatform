<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InternshipOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'internship_type' => $this->internship_type,
            'required_skills' => $this->required_skills ?? [],
            'match_score' => $this->whenHas('match_score'),
            'matching_skills' => $this->whenHas('matching_skills'),
            'applications_count' => $this->whenCounted('applications'),
            'company' => [
                'id' => $this->company?->id,
                'company_name' => $this->company?->company_name,
                'contact_name' => $this->company?->user?->name,
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
