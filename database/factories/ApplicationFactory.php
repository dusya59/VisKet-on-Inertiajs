<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\User;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'vacancy_id' => Vacancy::factory(),
            'user_id' => User::factory(),
            'cover_letter' => fake()->paragraph(2),
            'proposed_price' => fake()->numberBetween(5000, 100000),
            'status' => 'pending',
        ];
    }

    public function pending(): static
    {
        return $this->state(['status' => 'pending']);
    }

    public function accepted(): static
    {
        return $this->state(['status' => 'accepted', 'accepted_at' => now()]);
    }

    public function inProgress(): static
    {
        return $this->state([
            'status' => 'in_progress',
            'accepted_at' => now(),
            'in_progress_at' => now(),
        ]);
    }

    public function completed(): static
    {
        return $this->state([
            'status' => 'completed',
            'accepted_at' => now(),
            'in_progress_at' => now(),
            'completed_at' => now(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
    }

    public function disputed(): static
    {
        return $this->state([
            'status' => 'disputed',
            'disputed_at' => now(),
        ]);
    }

    public function withdrawn(): static
    {
        return $this->state([
            'status' => 'withdrawn',
            'withdrawn_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(['status' => 'rejected']);
    }

    public function executorMarkedDone(): static
    {
        return $this->state([
            'status' => 'in_progress',
            'executor_marked_completed_at' => now(),
        ]);
    }

    public function withoutPrice(): static
    {
        return $this->state(['proposed_price' => null]);
    }
}
