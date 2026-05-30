<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = ['from_user_id', 'to_user_id', 'amount', 'type', 'status', 'description', 'application_id', 'payout_id', 'completed_at'];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function payout()
    {
        return $this->belongsTo(Payout::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isReadyForCompletion(): bool
    {
        return $this->isPending() && $this->completed_at && now()->greaterThanOrEqualTo($this->completed_at->addDays(7));
    }
}
