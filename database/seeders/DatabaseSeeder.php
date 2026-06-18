<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@aimatcher.test'],
            [
                'name' => 'Platform Admin',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'is_banned' => false,
            ],
        );

        $this->call(DemoDataSeeder::class);
    }
}
