<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'reported_post_id',
        'reported_comment_id',
        'reason',
        'status',
    ];

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    public function reportedPost()
    {
        return $this->belongsTo(Post::class, 'reported_post_id');
    }

    public function reportedComment()
    {
        return $this->belongsTo(Comment::class, 'reported_comment_id');
    }

    public static function getReportableType($type)
    {
        return match ($type) {
            'user' => 'reported_user_id',
            'post' => 'reported_post_id',
            'comment' => 'reported_comment_id',
            default => null,
        };
    }
}
