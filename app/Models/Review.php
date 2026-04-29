<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = ['reviewer_id', 'reviewed_id', 'vacancy_id', 'rating', 'comment'];

    protected static function booted(): void
    {
        static::created(function (Review $review) {
            $reviewed = $review->reviewed;
            if ($reviewed) {
                $average = self::where('reviewed_id', $reviewed->id)->avg('rating');
                $reviewed->update(['rating' => round($average, 2)]);
            }
        });
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewed()
    {
        return $this->belongsTo(User::class, 'reviewed_id');
    }

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class);
    }
}
