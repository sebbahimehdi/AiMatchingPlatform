<?php

namespace App\Http\Requests\Company;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternshipOfferRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'location' => ['sometimes', 'string', 'max:120'],
            'internship_type' => ['sometimes', 'string', 'max:100'],
            'required_skills' => ['sometimes', 'array', 'min:1'],
            'required_skills.*' => ['string', 'max:100'],
        ];
    }
}
