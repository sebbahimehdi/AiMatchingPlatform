<?php

namespace Database\Seeders;

use App\Enums\ApplicationStatus;
use App\Models\Company;
use App\Models\InternshipApplication;
use App\Models\InternshipOffer;
use App\Models\Skill;
use App\Models\Student;
use Database\Factories\DemoData;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $skills = collect(DemoData::skills())
            ->mapWithKeys(fn (string $name) => [
                $name => Skill::firstOrCreate(['name' => $name])->id,
            ]);

        $companies = Company::factory()
            ->count(10)
            ->create();

        $offers = collect();

        foreach ($companies as $company) {
            $offers = $offers->merge(
                InternshipOffer::factory()
                    ->count(5)
                    ->for($company)
                    ->create(),
            );
        }

        $students = Student::factory()
            ->count(25)
            ->create();

        foreach ($students as $student) {
            $studentSkillIds = collect($student->skills ?? [])
                ->map(fn (string $name) => $skills->get($name))
                ->filter()
                ->values()
                ->all();

            $student->skillTags()->sync($studentSkillIds);
        }

        foreach ($students as $student) {
            $offersForStudent = $offers
                ->random(fake()->numberBetween(3, 8))
                ->values();

            foreach ($offersForStudent as $offer) {
                InternshipApplication::updateOrCreate(
                    [
                        'student_id' => $student->id,
                        'offer_id' => $offer->id,
                    ],
                    [
                        'status' => fake()->randomElement(ApplicationStatus::values()),
                    ],
                );
            }
        }
    }
}
