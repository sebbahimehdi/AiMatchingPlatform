<?php

namespace Database\Factories;

use App\Enums\ApplicationStatus;
use App\Models\InternshipApplication;
use App\Models\InternshipOffer;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InternshipApplication>
 */
class InternshipApplicationFactory extends Factory
{
    protected $model = InternshipApplication::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'offer_id' => InternshipOffer::factory(),
            'status' => fake()->randomElement(ApplicationStatus::values()),
        ];
    }
}
