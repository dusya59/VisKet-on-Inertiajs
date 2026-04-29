<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'vacancy_id',
        'user_id',
        'cover_letter',
        'proposed_price',
        'status',
        'withdrawn_at',
        'accepted_at',
        'in_progress_at',
        'completed_at',
        'cancelled_at',
        'disputed_at',
        'executor_marked_completed_at',
    ];

    protected $casts = [
        'withdrawn_at' => 'datetime',
        'accepted_at' => 'datetime',
        'in_progress_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'disputed_at' => 'datetime',
        'executor_marked_completed_at' => 'datetime',
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

    public function reviews()
    {
        return $this->hasMany(Review::class, 'vacancy_id', 'vacancy_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function isDisputed(): bool
    {
        return $this->status === 'disputed';
    }

    public function isWithdrawn(): bool
    {
        return $this->status === 'withdrawn';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function hasPendingTransaction(): bool
    {
        return $this->transaction && $this->transaction->status === 'pending';
    }

    public function hasDispute(): bool
    {
        return $this->dispute && $this->dispute->status === 'open';
    }

    public function canBeAccepted(): bool
    {
        return $this->isPending();
    }

    public function canBeMarkedDoneByExecutor(): bool
    {
        return $this->isInProgress() && ! $this->executor_marked_completed_at;
    }

    public function canBeCompletedByClient(): bool
    {
        return $this->isInProgress() && $this->executor_marked_completed_at !== null;
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['in_progress', 'accepted'], true);
    }

    public function canBeDisputed(): bool
    {
        return $this->isInProgress() || $this->isAccepted();
    }

    public function isClient(User $user): bool
    {
        return $this->vacancy->post->user_id === $user->id;
    }

    public function isExecutor(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function otherParty(User $user): ?User
    {
        if ($this->isClient($user)) {
            return $this->user;
        }

        if ($this->isExecutor($user)) {
            return $this->vacancy->post->user;
        }

        return null;
    }
}
