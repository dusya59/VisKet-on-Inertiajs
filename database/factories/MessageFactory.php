<?php

namespace Database\Factories;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    protected $model = Message::class;

    public function definition(): array
    {
        return [
            'chat_id' => Chat::factory(),
            'user_id' => User::factory(),
            'content' => fake()->paragraph(2),
            'is_system' => false,
            'is_price_proposal' => false,
            'proposed_price' => null,
            'price_proposal_status' => null,
        ];
    }

    public function system(): static
    {
        return $this->state(['is_system' => true]);
    }

    public function priceProposal(int $price): static
    {
        return $this->state([
            'is_price_proposal' => true,
            'proposed_price' => $price,
            'price_proposal_status' => 'pending',
        ]);
    }
}
