<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\User;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function show(User $user)
    {
        $authUser = auth()->user();
        $posts = $user->posts()
            ->with(['user', 'likes'])
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
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                        'profile_url' => route('profile', $post->user),
                    ],
                ];
            });
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'aboutme' => $user->aboutme,
            'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
            'following_count' => $user->following()->count(),
            'followers_count' => $user->followers()->count(),
            'is_subscribed' => $authUser ? $authUser->isSubscribedTo($user) : false,
        ];
        
        return Inertia::render('Profile/Show', [
            'user' => $userData,
            'posts' => $posts,
        ]);
    }

    public function likedPosts(User $user)
    {
        $likedPosts = $user->likes()->with(['post.user'])->get()->map(function ($like) {
            $post = $like->post;
            $post->image_url = $post->image ? Storage::url($post->image) : null;
            $post->likes_count = $post->likes()->count();
            return $post;
        });

        return Inertia::render('Profile/LikedPosts', [
            'user' => $user,
            'likedPosts' => $likedPosts,
        ]);
    }

    public function following(User $user)
    {
        return Inertia::render('Profile/Following', [
            'user' => $user,
            'following' => $user->following()->get()
        ]);
    }

    public function followers(User $user)
    {
        return Inertia::render('Profile/Followers', [
            'user' => $user,
            'followers' => $user->followers()->get()
        ]);
    }

    public function edit(User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }
        return Inertia::render('Profile/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'aboutme' => 'nullable|string|max:1000',
        ]);

        $user->update($validated);

        return redirect()->route('profile', $user->id)
            ->with('success', 'Профиль успешно обновлен');
    }

    public function updateAboutme(Request $request, User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'aboutme' => 'nullable|string|max:10000'
        ]);

        $user->update($validated);

        return redirect()->route('profile', $user->id);
    }

    public function updateAvatar(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($user->avatar) {
            Storage::delete('public/' . $user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return redirect()->route('profile', $user->id);
    }

    public function subscribe(User $user)
    {
        auth()->user()->following()->attach($user->id);
        return back();
    }

    public function unsubscribe(User $user)
    {
        auth()->user()->following()->detach($user->id);
        return back();
    }
}
