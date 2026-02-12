<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
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
                    'is_liked' => auth()->check() ? $post->likes->contains('user_id', auth()->id()) : false,
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'profile_url' => route('profile', $post->user),
                    ],
                ];
            });

        return Inertia::render('Posts/Show', [
            'posts' => $posts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Posts/Create');
    }

    public function store(Request $request)
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $imagePath = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => auth()->id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image' => $imagePath
        ]);

        return redirect()->route('posts.show', $post->id)
            ->with('success', 'Пост успешно создан!');
    }

    public function show(Post $post)
    {
        $post->load(['user', 'likes', 'comments.user']);

        $postData = [
            'id' => $post->id,
            'title' => $post->title,
            'description' => $post->description,
            'image_url' => $post->image ? asset('storage/' . $post->image) : null,
            'created_at' => $post->created_at->toISOString(),
            'likes_count' => $post->likes->count(),
            'is_liked' => auth()->check() ? $post->likes->contains('user_id', auth()->id()) : false,
            'like_url' => route('posts.like', $post->id),
            'show_url' => route('posts.show', $post->id), // Убедитесь, что это есть
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar_url' => $post->user->avatar ? asset('storage/' . $post->user->avatar) : null,
                'profile_url' => route('profile', $post->user->id),
            ],
            'comments' => $post->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'text' => $comment->text,
                    'created_at' => $comment->created_at->toISOString(),
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar_url' => $comment->user->avatar ? asset('storage/' . $comment->user->avatar) : null,
                        'profile_url' => route('profile', $comment->user->id),
                    ],
                ];
            })->toArray(),
        ];

        return Inertia::render('Posts/Show', [
            'post' => $postData,
        ]);
    }
    public function like(Post $post)
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        
        if ($post->likes()->where('user_id', $user->id)->exists()) {

            $post->likes()->where('user_id', $user->id)->delete();
            $liked = false;
        } else {

            $post->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return back()->with('success','Лайк поставлен');
    }

    public function edit(Post $post)
    {

        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('Posts/Edit', [
            'post' => $post->only(['id', 'title', 'description', 'image']),
        ]);
    }

    public function update(Request $request, Post $post)
    {

        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {

            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            
            $imagePath = $request->file('image')->store('posts', 'public');
            $validated['image'] = $imagePath;
        }

        $post->update($validated);

        return redirect()->route('posts.show', $post->id)
            ->with('success', 'Пост успешно обновлен!');
    }

    public function destroy(Post $post)
    {

        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('home')
            ->with('success', 'Пост успешно удален!');
    }

}