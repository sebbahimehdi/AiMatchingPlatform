<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('internship_offers', function (Blueprint $table) {
            $table->string('location')->nullable()->after('description');
            $table->string('internship_type')->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('internship_offers', function (Blueprint $table) {
            $table->dropColumn(['location', 'internship_type']);
        });
    }
};
