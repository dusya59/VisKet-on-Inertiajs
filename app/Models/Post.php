<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property bool $isLiked
 */
class Post extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'image', 'user_id', 'active'];

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
}
