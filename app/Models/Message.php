<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Message extends Model
{
    use HasFactory;
    protected $fillable = [
        'chat_id',
        'user_id',
        'content',
        'image_path',
        'video_path',
        'file_path',
        'original_file_name',
        'reply_to_id',
        'deleted_for_user_ids',
        'deleted_for_everyone',
        'deleted_by_id',
        'hidden_at',
        'is_system',
        'is_price_proposal',
        'proposed_price',
        'price_proposal_status',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_price_proposal' => 'boolean',
        'proposed_price' => 'integer',
        'deleted_for_user_ids' => 'array',
        'deleted_for_everyone' => 'boolean',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replyTo()
    {
        return $this->belongsTo(Message::class, 'reply_to_id');
    }

    public function deletedBy()
    {
        return $this->belongsTo(User::class, 'deleted_by_id');
    }

    public function scopeVisibleFor($query, User $user)
    {
        if ($user->is_admin) {
            return $query;
        }

        return $query->where(function ($q) use ($user) {
            $q->where('deleted_for_everyone', false)
              ->where(function ($q) use ($user) {
                  $q->whereNull('deleted_for_user_ids')
                    ->orWhereJsonDoesntContain('deleted_for_user_ids', $user->id);
              });
        });
    }
}
