<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('student_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('skill_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'skill_id']);
        });

        DB::table('students')
            ->select(['id', 'skills'])
            ->whereNotNull('skills')
            ->orderBy('id')
            ->chunkById(100, function ($students) {
                foreach ($students as $student) {
                    $skills = json_decode($student->skills, true);

                    if (! is_array($skills)) {
                        continue;
                    }

                    foreach ($skills as $skill) {
                        $name = strtolower(trim((string) $skill));

                        if ($name === '') {
                            continue;
                        }

                        DB::table('skills')->updateOrInsert(
                            ['name' => $name],
                            ['updated_at' => now(), 'created_at' => now()],
                        );

                        $existingSkillId = DB::table('skills')->where('name', $name)->value('id');

                        DB::table('student_skills')->updateOrInsert(
                            ['student_id' => $student->id, 'skill_id' => $existingSkillId],
                            ['updated_at' => now(), 'created_at' => now()],
                        );
                    }
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_skills');
        Schema::dropIfExists('skills');
    }
};
