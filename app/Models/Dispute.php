<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'initiator_id',
        'reason',
        'status',
        'admin_id',
        'chat_id',
        'resolution',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function chat()
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }

    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isTakenByAdmin(): bool
    {
        return $this->isOpen() && $this->admin_id !== null;
    }
}
