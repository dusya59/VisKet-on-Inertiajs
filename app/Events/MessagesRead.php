<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessagesRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chatId;

    public $userId;

    public $lastReadAt;

    public function __construct($chatId, $userId, $lastReadAt)
    {
        $this->chatId = $chatId;
        $this->userId = $userId;
        $this->lastReadAt = $lastReadAt;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('chat.'.$this->chatId);
    }

    public function broadcastWith()
    {
        return [
            'user_id' => $this->userId,
            'last_read_at' => $this->lastReadAt instanceof \DateTime ? $this->lastReadAt->format('c') : $this->lastReadAt,
        ];
    }

    public function broadcastAs()
    {
        return 'messages.read';
    }
}
