<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Skill;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes', 'vacancy', 'vacancy.skills'])
            ->latest()
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'description' => $post->description,
                    'image_url' => $post->image ? asset('storage/'.$post->image) : null,
                    'show_url' => route('posts.show', $post->id),
                    'like_url' => route('posts.like', $post->id),
                    'likes_count' => $post->likes->count(),
                    'is_liked' => auth()->check()
                        ? $post->likes->contains('user_id', auth()->id())
                        : false,
                    'is_vacancy' => $post->vacancy !== null,
                    'vacancy' => $post->vacancy ? [
                        'position' => $post->vacancy->position,
                        'skills' => $post->vacancy->skills->map(function ($skill) {
                            return [
                                'id' => $skill->id,
                                'name' => $skill->name,
                            ];
                        }),
                    ] : null,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'profile_url' => route('profile', $post->user),
                    ],
                ];
            });

        $skills = Skill::orderBy('name')->get();

        $userSkills = [];
        if (auth()->check()) {
            $userSkills = auth()->user()->skills->map(function ($skill) {
                return [
                    'id' => $skill->id,
                    'name' => $skill->name,
                    'level' => $skill->pivot->level,
                ];
            });
        }

        return Inertia::render('Home', [
            'posts' => $posts,
            'skills' => $skills,
            'userSkills' => $userSkills,
        ]);
    }
}
