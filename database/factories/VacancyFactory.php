<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\Vacancy;
use Illuminate\Database\Eloquent\Factories\Factory;

class VacancyFactory extends Factory
{
    protected $model = Vacancy::class;

    public function definition(): array
    {
        return [
            'post_id' => Post::factory()->vacancy(),
            'position' => fake()->jobTitle(),
            'budget_min' => fake()->numberBetween(10000, 50000),
            'budget_max' => fake()->numberBetween(50000, 150000),
            'deadline' => fake()->dateTimeBetween('+1 week', '+3 months'),
            'requirements' => fake()->paragraph(2),
            'status' => 'open',
        ];
    }

    public function inProgress(): static
    {
        return $this->state(['status' => 'in_progress']);
    }

    public function closed(): static
    {
        return $this->state(['status' => 'closed']);
    }
}
