<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\InternshipOffer;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthAndRecommendationTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_register_and_receive_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Amina Student',
            'email' => 'amina@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'student',
            'skills' => ['python', 'sql'],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('user.role', 'student')
            ->assertJsonStructure([
                'message',
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'amina@example.com',
            'role' => 'student',
        ]);
        $this->assertDatabaseHas('students', [
            'user_id' => User::where('email', 'amina@example.com')->value('id'),
        ]);
    }

    public function test_student_recommendations_are_ranked_from_offer_skills(): void
    {
        $studentUser = User::factory()->create([
            'role' => User::ROLE_STUDENT,
        ]);
        $student = Student::create([
            'user_id' => $studentUser->id,
            'skills' => ['python', 'sql', 'react'],
        ]);

        $companyUser = User::factory()->create([
            'role' => User::ROLE_COMPANY,
        ]);
        $company = Company::create([
            'user_id' => $companyUser->id,
            'company_name' => 'Northwind Labs',
            'description' => 'Builds data products.',
        ]);

        InternshipOffer::create([
            'company_id' => $company->id,
            'title' => 'Backend Intern',
            'description' => 'Work on APIs and dashboards.',
            'required_skills' => ['php', 'laravel', 'mysql'],
        ]);

        InternshipOffer::create([
            'company_id' => $company->id,
            'title' => 'AI Intern',
            'description' => 'Build ranking and recommendation features.',
            'required_skills' => ['python', 'sql'],
        ]);

        Sanctum::actingAs($studentUser);

        $response = $this->getJson('/api/recommendations');

        $response
            ->assertOk()
            ->assertJsonPath('data.0.title', 'AI Intern')
            ->assertJsonPath('data.0.match_score', 100);

        $this->assertDatabaseHas('match_scores', [
            'student_id' => $student->id,
            'offer_id' => InternshipOffer::where('title', 'AI Intern')->value('id'),
            'score' => 100,
        ]);
    }
}
