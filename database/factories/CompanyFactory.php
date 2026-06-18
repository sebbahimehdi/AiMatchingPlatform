<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Company>
 */
class CompanyFactory extends Factory
{
    protected $model = Company::class;

    public function definition(): array
    {
        $focus = fake()->randomElement([
            'cloud platforms',
            'AI-powered business tools',
            'fintech products',
            'healthcare software',
            'e-commerce analytics',
            'developer productivity',
            'cybersecurity services',
            'data-driven marketing',
        ]);

        return [
            'user_id' => User::factory()->company(),
            'company_name' => fake()->unique()->company(),
            'description' => fake()->sentence(14).' The team builds '.$focus.' for modern teams.',
        ];
    }
}
