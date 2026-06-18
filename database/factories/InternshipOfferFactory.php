<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\InternshipOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InternshipOffer>
 */
class InternshipOfferFactory extends Factory
{
    protected $model = InternshipOffer::class;

    public function definition(): array
    {
        $title = fake()->randomElement(DemoData::jobTitles());
        $skills = fake()->randomElements(DemoData::skillsForTitle($title), fake()->numberBetween(4, 7));

        return [
            'company_id' => Company::factory(),
            'title' => $title,
            'description' => fake()->paragraph(4).' You will collaborate with product, engineering, and design teams while receiving mentorship from senior staff.',
            'location' => fake()->randomElement(DemoData::moroccanCities()),
            'internship_type' => fake()->randomElement(DemoData::internshipTypes()),
            'required_skills' => array_values($skills),
        ];
    }
}
