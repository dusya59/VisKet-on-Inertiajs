<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class MessageUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $user;

    public function __construct(User $user, Message $message)
    {
        $this->user = $user;
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->chat_id)
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => [
                'id' => $this->message->id,
                'content' => $this->message->content,
                'image_url' => $this->message->image_path ? asset('storage/' . $this->message->image_path) : null,
                'video_url' => $this->message->video_path ? asset('storage/' . $this->message->video_path) : null,
                'file_url' => $this->message->file_path ? asset('storage/' . $this->message->file_path) : null,
                'file_name' => $this->message->file_path ? basename($this->message->file_path) : null,
                'file_size' => $this->message->file_path ? Storage::disk('public')->size($this->message->file_path) : null,
                'chat_id' => $this->message->chat_id,
                'user_id' => $this->message->user_id,
                'time' => $this->message->created_at->setTimezone('Asia/Yekaterinburg')->format('H:i'),
            ],
        ];
    }
}