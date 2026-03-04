<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Broadcasting\PrivateChannel;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $message;

    public function __construct(User $user, Message $message)
    {
        $this->user = $user;
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        Log::info('Broadcasting message sent event', [
            'user_id' => $this->user->id,
            'message_id' => $this->message->id,
        ]);
        
            return [
        new PrivateChannel('chat.' . $this->message->chat_id)
    ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
{
    return [
        'user' => [
            'id' => $this->user->id,
            'name' => $this->user->name,
            'avatar_url' => $this->user->avatar
                ? asset('storage/' . $this->user->avatar)
                : asset('images/User-avatar.png'),
        ],
        'message' => [
            'id' => $this->message->id,
            'content' => $this->message->content,  
            'image_url' => $this->message->image_path ? asset('storage/' . $this->message->image_path) : null,
            'video_url' => $this->message->video_path ? asset('storage/' . $this->message->video_path) : null,
            'file_url' => $this->message->file_path ? asset('storage/' . $this->message->file_path) : null,
            'chat_id' => $this->message->chat_id,
            'user_id' => $this->message->user_id,
            'created_at' => $this->message->created_at->toISOString(),
        ],
    ];
}
}