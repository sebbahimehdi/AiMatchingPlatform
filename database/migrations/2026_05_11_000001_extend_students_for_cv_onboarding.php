<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('user_id');
            $table->string('city')->nullable()->after('phone');
            $table->string('university')->nullable()->after('city');
            $table->string('degree')->nullable()->after('university');
            $table->string('field_of_study')->nullable()->after('degree');
            $table->string('experience_title')->nullable()->after('field_of_study');
            $table->text('experience_description')->nullable()->after('experience_title');
            $table->json('preferred_technologies')->nullable()->after('cv_path');
            $table->string('internship_type')->nullable()->after('preferred_technologies');
            $table->string('preferred_location')->nullable()->after('internship_type');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'city',
                'university',
                'degree',
                'field_of_study',
                'experience_title',
                'experience_description',
                'preferred_technologies',
                'internship_type',
                'preferred_location',
            ]);
        });
    }
};
