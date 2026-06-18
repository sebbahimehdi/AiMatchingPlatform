<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in([UserRole::Student->value, UserRole::Company->value])],
            'company_name' => [
                Rule::requiredIf(fn () => $this->input('role') === UserRole::Company->value),
                'nullable',
                'string',
                'max:255',
            ],
            'description' => ['nullable', 'string'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:40'],
            'city' => ['nullable', 'string', 'max:120'],
            'university' => ['nullable', 'string', 'max:255'],
            'degree' => ['nullable', 'string', 'max:255'],
            'field_of_study' => ['nullable', 'string', 'max:255'],
            'experience_title' => ['nullable', 'string', 'max:255'],
            'experience_description' => ['nullable', 'string'],
            'preferred_technologies' => ['nullable', 'array'],
            'preferred_technologies.*' => ['string', 'max:100'],
            'technologies' => ['nullable', 'array'],
            'technologies.*' => ['string', 'max:100'],
            'internship_type' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:120'],
            'preferred_location' => ['nullable', 'string', 'max:120'],
            'cv' => ['nullable', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
