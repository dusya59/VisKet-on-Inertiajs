<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\Chat;
use App\Models\Dispute;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DisputeFactory extends Factory
{
    protected $model = Dispute::class;

    public function definition(): array
    {
        return [
            'application_id' => Application::factory(),
            'initiator_id' => User::factory(),
            'reason' => fake()->paragraph(2),
            'status' => 'open',
            'chat_id' => null,
            'admin_id' => null,
            'resolution' => null,
        ];
    }

    public function resolved(): static
    {
        return $this->state([
            'status' => 'resolved',
            'admin_id' => User::factory(),
            'resolution' => fake()->paragraph(),
        ]);
    }

    public function forApplication(Application $application): static
    {
        return $this->state([
            'application_id' => $application->id,
            'chat_id' => $application->chat?->id,
        ]);
    }
}
