<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Админ',
            'email' => 'admin@visket.ru',
            'is_admin' => true,
            'balance' => 0,
        ]);

        User::factory()->create([
            'name' => 'Клиент',
            'email' => 'client@visket.ru',
            'balance' => 100000,
        ]);

        User::factory()->create([
            'name' => 'Исполнитель',
            'email' => 'executor@visket.ru',
            'balance' => 0,
        ]);
    }
}
