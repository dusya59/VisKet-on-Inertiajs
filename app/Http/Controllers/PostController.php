<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Chat;
use App\Models\Message;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $posts = Post::with(['user', 'likes'])
            ->where(function ($query) use ($userId) {
                $query->where('active', true)
                    ->orWhere('user_id', $userId);
            })
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
                    'is_liked' => Auth::check() ? $post->likes->contains('user_id', Auth::id()) : false,
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
        return Inertia::render('Posts/Create', [
            'skills' => \App\Models\Skill::all(),
        ]);
    }

    public function store(Request $request)
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $imagePath = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image' => $imagePath,
        ]);

        return redirect()->route('posts.show', $post->id)
            ->with('success', 'Пост успешно создан!');
    }

    public function show(Post $post)
    {
        if (! $post->active && $post->user_id !== Auth::id()) {
            abort(404);
        }

        $post->load(['user', 'likes', 'comments.user', 'vacancy.skills']);

        $vacancyData = null;
        if ($post->vacancy) {
            $post->vacancy->load('applications.user');
            $vacancyData = [
                'position' => $post->vacancy->position,
                'budget_min' => $post->vacancy->budget_min,
                'budget_max' => $post->vacancy->budget_max,
                'deadline' => $post->vacancy->deadline,
                'requirements' => $post->vacancy->requirements,
                'status' => $post->vacancy->status,
                'applications_count' => $post->vacancy->applications->count(),
                'applications' => $post->vacancy->applications->map(function ($application) use ($post) {
                    $chat = \App\Models\Chat::whereHas('users', function ($query) use ($post) {
                        $query->where('users.id', $post->user_id);
                    })->whereHas('users', function ($query) use ($application) {
                        $query->where('users.id', $application->user_id);
                    })->first();

                    return [
                        'id' => $application->id,
                        'cover_letter' => $application->cover_letter,
                        'proposed_price' => $application->proposed_price,
                        'created_at' => $application->created_at->toISOString(),
                        'chat_url' => $chat ? route('chat', $chat->id) : null,
                        'user' => [
                            'id' => $application->user->id,
                            'name' => $application->user->name,
                            'avatar_url' => $application->user->avatar ? asset('storage/'.$application->user->avatar) : null,
                            'profile_url' => route('profile', $application->user->id),
                        ],
                    ];
                })->toArray(),
                'skills' => $post->vacancy->skills->map(function ($skill) {
                    return [
                        'id' => $skill->id,
                        'name' => $skill->name,
                        'level' => $skill->pivot->level ?? 3,
                    ];
                })->toArray(),
            ];
        }

        $postData = [
            'id' => $post->id,
            'title' => $post->title,
            'description' => $post->description,
            'image_url' => $post->image ? asset('storage/'.$post->image) : null,
            'created_at' => $post->created_at->toISOString(),
            'likes_count' => $post->likes->count(),
            'is_liked' => Auth::check() ? $post->likes->contains('user_id', Auth::id()) : false,
            'like_url' => route('posts.like', $post->id),
            'show_url' => route('posts.show', $post->id),
            'edit_url' => $post->user_id === Auth::id() ? route('posts.edit', $post->id) : null,
            'delete_url' => $post->user_id === Auth::id() ? route('posts.destroy', $post->id) : null,
            'is_hidden' => ! $post->active,
            'is_vacancy' => $post->vacancy !== null,
            'vacancy' => $vacancyData,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar_url' => $post->user->avatar ? asset('storage/'.$post->user->avatar) : null,
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
                        'avatar_url' => $comment->user->avatar ? asset('storage/'.$comment->user->avatar) : null,
                        'profile_url' => route('profile', $comment->user->id),
                    ],
                ];
            })->toArray(),
        ];

        if ($post->vacancy && Auth::check()) {
            $existingApplication = Application::where('vacancy_id', $post->vacancy->id)
                ->where('user_id', Auth::id())
                ->first();

            $postData['has_application'] = (bool) $existingApplication;
            $postData['application_status'] = $existingApplication ? $existingApplication->status : null;
            $postData['respond_url'] = route('vacancies.respond', $post->vacancy->id);
        } else {
            $postData['has_application'] = false;
            $postData['application_status'] = null;
            $postData['respond_url'] = null;
        }

        if (Auth::check()) {
            $sharedChats = Auth::user()->chats()
                ->with(['users' => fn ($q) => $q->where('id', '!=', Auth::id())])
                ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
                ->withCount('messages')
                ->withPivot('last_read_at')
                ->orderByDesc('updated_at')
                ->get()
                ->map(function (Chat $chat) {
                    $otherUser = $chat->users->first();

                    $lastReadAt = $chat->pivot?->last_read_at ?? Auth::user()->created_at;
                    $unreadCount = $chat->messages()
                        ->where('user_id', '!=', Auth::id())
                        ->where('created_at', '>', $lastReadAt)
                        ->count();

                    return [
                        'id' => $chat->id,
                        'latest_message' => $chat->messages->first()
                            ? [
                                'content' => $chat->messages->first()->content,
                                'created_at_human' => $chat->messages->first()->created_at->diffForHumans(),
                            ]
                            : null,
                        'other_user' => $otherUser ? [
                            'id' => $otherUser->id,
                            'name' => $otherUser->name,
                            'avatar_url' => $otherUser->avatar
                                ? asset('storage/'.$otherUser->avatar)
                                : asset('images/User-avatar.png'),
                        ] : null,
                        'unread_count' => $unreadCount,
                    ];
                });

            $postData['shared_chats'] = $sharedChats;
        } else {
            $postData['shared_chats'] = collect();
        }

        return Inertia::render('Posts/Show', [
            'post' => $postData,
        ]);
    }

    public function like(Post $post)
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        if ($post->likes()->where('user_id', $user->id)->exists()) {
            $post->likes()->where('user_id', $user->id)->delete();
            $liked = false;
        } else {
            $post->likes()->create(['user_id' => $user->id]);
            $liked = true;
        }

        return back()->with('success', 'Лайк поставлен');
    }

    public function edit(Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        $post->load('vacancy.skills');

        $vacancyData = null;
        if ($post->vacancy) {
            $vacancyData = [
                'position' => $post->vacancy->position,
                'budget_min' => $post->vacancy->budget_min,
                'budget_max' => $post->vacancy->budget_max,
                'deadline' => $post->vacancy->deadline,
                'requirements' => $post->vacancy->requirements,
                'status' => $post->vacancy->status,
                'skills' => $post->vacancy->skills->map(function ($skill) {
                    return [
                        'id' => $skill->id,
                        'name' => $skill->name,
                        'level' => $skill->pivot->level ?? 3,
                    ];
                })->toArray(),
            ];
        }

        return Inertia::render('Posts/Edit', [
            'post' => [
                'id' => $post->id,
                'title' => $post->title,
                'description' => $post->description,
                'image_url' => $post->image ? asset('storage/'.$post->image) : null,
                'update_url' => route('posts.update', $post->id),
                'show_url' => route('posts.show', $post->id),
                'vacancy' => $vacancyData,
            ],
            'skills' => \App\Models\Skill::all(),
        ]);
    }

    public function update(Request $request, Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'position' => 'nullable|string|max:255',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'requirements' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*' => 'exists:skills,id',
        ]);

        if ($request->hasFile('image')) {
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }

            $imagePath = $request->file('image')->store('posts', 'public');
            $validated['image'] = $imagePath;
        }

        $post->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image' => $validated['image'] ?? $post->image,
        ]);

        if ($post->vacancy) {
            $post->vacancy->update([
                'position' => $validated['position'] ?? null,
                'budet_min' => $validated['budget_min'] ?? null,
                'budget_max' => $validated['budget_max'] ?? null,
                'deadline' => $validated['deadline'] ?? null,
                'requirements' => $validated['requirements'] ?? null,
            ]);

            if (isset($validated['skills'])) {
                $post->vacancy->skills()->sync($validated['skills']);
            }
        }

        return redirect()->route('posts.show', $post->id)
            ->with('success', 'Пост успешно обновлен!');
    }

    public function destroy(Post $post)
    {
        if ($post->user_id !== Auth::id()) {
            abort(403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('home')
            ->with('success', 'Пост успешно удален!');
    }

    public function storeVacancy(Request $request)
    {
        if (! Auth::check()) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'position' => 'required|string|max:255',
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'requirements' => 'nullable|string',
            'skills' => 'nullable|array',
            'skills.*.id' => 'exists:skills,id',
            'skills.*.level' => 'nullable|integer|min:1|max:5',
        ]);

        $imagePath = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => Auth::id(),
            'title' => $validated['title'] ?? '',
            'description' => $validated['description'] ?? '',
            'image' => $imagePath,
        ]);

        $vacancy = $post->vacancy()->create([
            'position' => $validated['position'],
            'budget_min' => $validated['budget_min'] ?? null,
            'budget_max' => $validated['budget_max'] ?? null,
            'deadline' => $validated['deadline'] ?? null,
            'requirements' => $validated['requirements'] ?? null,
            'status' => 'open',
        ]);

        if (! empty($validated['skills'])) {
            foreach ($validated['skills'] as $skill) {
                $vacancy->skills()->attach($skill['id'], [
                    'level' => $skill['level'] ?? 3,
                ]);
            }
        }

        return redirect()->route('posts.show', $post->id)
            ->with('success', 'Вакансия успешно создана!');
    }

    public function share(Request $request, Post $post){

    $validated = $request->validate([
        'users'   => 'required|array|min:1',
        'users.*' => 'exists:chats,id',
        'message' => 'nullable|string|max:5000',
    ]);

    $user = Auth::user();

    $chats = Chat::whereIn('id', $validated['users'])
        ->whereHas('users', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->get();

    $postUrl = route('posts.show', $post->id);

    foreach ($chats as $chat) {
        Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => $postUrl,
        ]);
        if (!empty($validated['message'])) {
            Message::create([
                'chat_id' => $chat->id,
                'user_id' => $user->id,
                'content' => $validated['message'],
            ]);
        }

        $chat->touch();
    }

    return back()->with('success', 'Пост отправлен в выбранные чаты');
    }
}
