<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vacancy extends Model
{
    use HasFactory;

    protected $fillable = ['post_id', 'position', 'budget_min', 'budget_max', 'deadline', 'requirements', 'status'];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'vacancy_skills');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
