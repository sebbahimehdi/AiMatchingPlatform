<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        $skills = fake()->randomElements(DemoData::skills(), fake()->numberBetween(5, 9));

        return [
            'user_id' => User::factory()->student(),
            'phone' => fake()->phoneNumber(),
            'city' => fake()->randomElement(DemoData::moroccanCities()),
            'university' => fake()->randomElement(DemoData::universities()),
            'degree' => fake()->randomElement(['Bachelor in Computer Science', 'Master in Data Science', 'Software Engineering', 'Information Systems', 'AI and Data Engineering']),
            'field_of_study' => fake()->randomElement(['Computer Science', 'Data Science', 'Software Engineering', 'Artificial Intelligence', 'Cybersecurity', 'Information Systems']),
            'experience_title' => fake()->randomElement(['Academic Web Project', 'Mobile App Prototype', 'Data Analytics Case Study', 'Machine Learning Coursework', 'Open Source Contributor']),
            'experience_description' => fake()->paragraph(3),
            'skills' => array_values($skills),
            'preferred_technologies' => fake()->randomElements($skills, min(4, count($skills))),
            'internship_type' => fake()->randomElement(DemoData::internshipTypes()),
            'preferred_location' => fake()->randomElement(DemoData::moroccanCities()),
        ];
    }
}
