<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Demo Demo',
            'email' => 'demo@demo.com',
            'city_name' =>null,
            'city_lat' =>null,
            'city_lon' =>null,
            'password' => Hash::make('password')
        ]);
    }
}
