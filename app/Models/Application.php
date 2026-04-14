<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = ['vacancy_id', 'user_id', 'cover_letter', 'proposed_price', 'status', 'withdrawn_at', 'completed_at'];

    protected $casts = [
        'withdrawn_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function chat()
    {
        return $this->hasOne(Chat::class, 'application_id');
    }

    public function transaction()
    {
        return $this->hasOne(Transaction::class);
    }

    public function dispute()
    {
        return $this->hasOne(Dispute::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isWithdrawn(): bool
    {
        return $this->status === 'withdrawn';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function hasPendingTransaction(): bool
    {
        return $this->transaction && $this->transaction->status === 'pending';
    }

    public function hasDispute(): bool
    {
        return $this->dispute && $this->dispute->status === 'open';
    }

    public function canConfirmCompletion(): bool
    {
        return $this->isAccepted() && ! $this->completed_at && ! $this->hasDispute();
    }

    public function isAwaitingCompletion(): bool
    {
        return $this->completed_at && ! $this->hasPendingTransaction();
    }
}
