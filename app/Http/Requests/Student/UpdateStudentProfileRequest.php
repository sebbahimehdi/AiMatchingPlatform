<?php

namespace App\Http\Requests\Student;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()?->id),
            ],
            'skills' => ['sometimes', 'array'],
            'skills.*' => ['string', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:40'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'university' => ['sometimes', 'nullable', 'string', 'max:255'],
            'degree' => ['sometimes', 'nullable', 'string', 'max:255'],
            'field_of_study' => ['sometimes', 'nullable', 'string', 'max:255'],
            'experience_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'experience_description' => ['sometimes', 'nullable', 'string'],
            'preferred_technologies' => ['sometimes', 'array'],
            'preferred_technologies.*' => ['string', 'max:100'],
            'internship_type' => ['sometimes', 'nullable', 'string', 'max:100'],
            'preferred_location' => ['sometimes', 'nullable', 'string', 'max:120'],
            'cv' => ['sometimes', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
