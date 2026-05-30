<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'payout_method_id',
        'transaction_id',
        'amount',
        'currency',
        'yookassa_payout_id',
        'status',
        'description',
        'metadata',
        'succeeded_at',
        'canceled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
        'succeeded_at' => 'datetime',
        'canceled_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payoutMethod()
    {
        return $this->belongsTo(PayoutMethod::class);
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isSucceeded(): bool
    {
        return $this->status === 'succeeded';
    }

    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }
}
