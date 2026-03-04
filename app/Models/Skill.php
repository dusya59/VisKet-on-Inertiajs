<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_skills')->withPivot('level');
    }

    public function vacancies()
    {
        return $this->belongsToMany(Vacancy::class, 'vacancy_skills')->withPivot('level');
    }
}
