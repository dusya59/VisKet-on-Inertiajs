<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(3),
            'image' => '',
            'active' => true,
            'status' => 'open',
            'type' => 'regular',
        ];
    }

    public function vacancy(): static
    {
        return $this->state(['type' => 'vacancy']);
    }

    public function closed(): static
    {
        return $this->state(['status' => 'closed', 'active' => false]);
    }

    public function inactive(): static
    {
        return $this->state(['active' => false]);
    }
}
