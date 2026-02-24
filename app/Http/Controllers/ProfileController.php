<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

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
                    'image_url' => $post->image ? asset('storage/'.$post->image) : null,
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
            'rating' => $user->rating,
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
        return Inertia::render('Profile/LikedPosts', [
            'user' => $user,
            'likedPosts' => $user->likes()->with(['post.user'])->get()->map(function ($like) {
                return [
                    'id' => $like->id,
                    'post' => [
                        'id' => $like->post->id,
                        'title' => $like->post->title,
                        'description' => $like->post->description,
                        'image_url' => $like->post->image ? Storage::url($like->post->image) : null,
                        'likes_count' => $like->post->likes->count(),
                        'is_liked' => true,
                        'show_url' => "/posts/{$like->post->id}",
                        'like_url' => "/posts/{$like->post->id}/like",
                        'user' => [
                            'id' => $like->post->user->id,
                            'name' => $like->post->user->name,
                            'profile_url' => "/profile/{$like->post->user->id}",
                        ],
                    ],
                ];
            }),
        ]);
    }

    public function following(User $user)
    {
        return Inertia::render('Profile/Following', [
            'user' => $user,
            'following' => $user->following()->paginate(10),
        ]);
    }

    public function followers(User $user)
    {
        $authUser = auth()->user();

        $followersData = $user->followers()->get()->map(function ($follower) use ($authUser) {
            $data = [
                'id' => $follower->id,
                'name' => $follower->name,
                'avatar' => $follower->avatar,
                'is_subscribed' => false,
                'is_mutual' => false,
            ];

            if ($authUser) {
                $data['is_subscribed'] = $authUser->isSubscribedTo($follower);
                $data['is_mutual'] = $authUser->isSubscribedTo($follower) && $follower->isSubscribedTo($authUser);
            }

            return $data;
        });

        return Inertia::render('Profile/Followers', [
            'user' => $user,
            'followers' => [
                'data' => $followersData,
            ],
        ]);
    }

    public function edit(User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'aboutme' => $user->aboutme,
            'avatar_url' => $user->avatar ? Storage::url($user->avatar) : null,
        ];

        return Inertia::render('Profile/Edit', [
            'user' => $userData,
        ]);
    }

    public function update(Request $request, User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'aboutme' => 'nullable|string|max:1000',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($validated);

        return Inertia::location(route('profile', $user->id));
    }

    public function updateAboutme(Request $request, User $user)
    {
        if (auth()->id() !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'aboutme' => 'nullable|string|max:10000',
        ]);

        $user->update($validated);

        return redirect()->route('profile', $user->id);
    }

    public function updateAvatar(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($user->avatar) {
            Storage::delete('public/'.$user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return redirect()->route('profile', $user->id);
    }

    public function subscribe(User $user)
    {
        auth()->user()->following()->toggle($user->id);

        return back();
    }

    public function unsubscribe(User $user)
    {
        auth()->user()->following()->detach($user->id);

        return back();
    }

    public function ratings(User $user)
    {
        $reviews = $user->reviewsReceived()
            ->with('reviewer')
            ->latest()
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'reviewer' => [
                        'id' => $review->reviewer->id,
                        'name' => $review->reviewer->name,
                        'avatar_url' => $review->reviewer->avatar ? Storage::url($review->reviewer->avatar) : null,
                        'profile_url' => route('profile', $review->reviewer->id),
                    ],
                ];
            });

        return Inertia::render('Profile/Ratings', [
            'user' => $user,
            'reviews' => $reviews,
            'averageRating' => $user->rating,
            'reviewsCount' => $reviews->count(),
        ]);
    }
}
