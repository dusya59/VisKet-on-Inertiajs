<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'image', 'user_id', 'active', 'status'];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function vacancy()
    {
        return $this->hasOne(Vacancy::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reported_post_id');
    }

    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    public function scopeVisible($query)
    {
        return $query->where('active', true);
    }

    public function isHidden(): bool
    {
        return ! $this->active && $this->status !== 'closed';
    }

    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
