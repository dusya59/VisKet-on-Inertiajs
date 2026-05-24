<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        return [
            'from_user_id' => User::factory(),
            'to_user_id' => null,
            'amount' => fake()->numberBetween(1000, 100000),
            'type' => 'payment',
            'status' => 'pending',
            'description' => fake()->sentence(3),
            'application_id' => Application::factory(),
        ];
    }

    public function completed(): static
    {
        return $this->state([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(['status' => 'cancelled']);
    }

    public function forApplication(Application $application): static
    {
        return $this->state(['application_id' => $application->id]);
    }
}
