<?php

namespace App\Http\Controllers;
use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Http\Request;

class HomeController extends Controller
{
public function index()
    {
        $posts = Post::with(['user', 'likes'])
            ->latest()
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'description' => $post->description,
                    'image_url' => $post->image ? asset('storage/' . $post->image) : null,
                    'show_url' => route('posts.show', $post->id),
                    'like_url' => route('posts.like', $post->id),
                    'likes_count' => $post->likes->count(),
                    'is_liked' => auth()->check()
                        ? $post->likes->contains('user_id', auth()->id())
                        : false,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'profile_url' => route('profile', $post->user),
                    ],
                ];
            });

        return Inertia::render('Home', [
            'posts' => $posts,
        ]);
    }
}
