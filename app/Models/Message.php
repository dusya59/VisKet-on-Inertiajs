<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'chat_id',
        'user_id',
        'content',
        'image_path',
        'video_path',
        'file_path',
        'is_system',
        'is_price_proposal',
        'proposed_price',
        'price_proposal_status',
    ];

    protected $casts = [
        'is_system' => 'boolean',
        'is_price_proposal' => 'boolean',
        'proposed_price' => 'integer',
    ];

    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
