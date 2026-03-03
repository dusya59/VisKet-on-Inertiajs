<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function startChat(User $user)
    {
        $authUser = auth()->user();

        $chat = $authUser->chats()
            ->whereHas('users', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (! $chat) {
            $chat = Chat::create();
            $chat->users()->attach([$authUser->id, $user->id]);
        }

        return redirect()->route('chat', $chat);
    }

    public function index()
    {
        $user = auth()->user();

        $chats = $user->chats()
            ->with(['users' => fn ($q) => $q->where('id', '!=', $user->id)])
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Chat $chat) {
                $otherUser = $chat->users->first();

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
                ];
            });

        return Inertia::render('Chat/Chats', [
            'chats' => $chats,
            'activeChat' => null,
        ]);
    }

    public function show(Chat $chat)
    {
        $user = auth()->user();
        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        $activeChat = $chat->load(['messages.user', 'users', 'application.user', 'application.vacancy']);

        $chats = $user->chats()
            ->with(['users' => fn ($q) => $q->where('id', '!=', $user->id)])
            ->with(['messages' => fn ($q) => $q->latest()->limit(1)])
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Chat $chat) {
                $otherUser = $chat->users->first();

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
                ];
            });

        $applicationData = null;
        if ($chat->application) {
            $app = $chat->application;
            $applicationData = [
                'id' => $app->id,
                'cover_letter' => $app->cover_letter,
                'proposed_price' => $app->proposed_price,
                'status' => $app->status,
                'created_at' => $app->created_at->toISOString(),
                'user' => [
                    'id' => $app->user->id,
                    'name' => $app->user->name,
                    'avatar_url' => $app->user->avatar
                        ? asset('storage/'.$app->user->avatar)
                        : asset('images/User-avatar.png'),
                    'created_at' => $app->user->created_at->toISOString(),
                    'rating' => $app->user->rating,
                ],
                'vacancy' => $app->vacancy ? [
                    'id' => $app->vacancy->id,
                    'position' => $app->vacancy->position,
                    'post_id' => $app->vacancy->post_id,
                ] : null,
            ];
        }

        $activeChatData = [
            'id' => $activeChat->id,
            'application' => $applicationData,
            'users' => $activeChat->users->map(function (User $u) {
                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'avatar_url' => $u->avatar
                        ? asset('storage/'.$u->avatar)
                        : asset('images/User-avatar.png'),
                ];
            }),
            'messages' => $activeChat->messages->map(function ($m) {
                return [
                    'id' => $m->id,
                    'content' => $m->content,
                    'image_url' => $m->image_path ? asset('storage/'.$m->image_path) : null,
                    'video_url' => $m->video_path ? asset('storage/'.$m->video_path) : null,
                    'file_url' => $m->file_path ? asset('storage/'.$m->file_path) : null,
                    'file_name' => $m->file_path ? basename($m->file_path) : null,
                    'file_size' => $m->file_path ? Storage::disk('public')->size($m->file_path) : null,
                    'user' => [
                        'id' => $m->user->id,
                        'name' => $m->user->name,
                        'avatar_url' => $m->user->avatar
                            ? asset('storage/'.$m->user->avatar)
                            : asset('images/User-avatar.png'),
                    ],
                    'time' => $m->created_at->setTimezone('Asia/Yekaterinburg')->format('H:i'),
                    'is_mine' => $m->user_id === auth()->id(),
                ];
            }),
        ];

        return Inertia::render('Chat/Chats', [
            'chats' => $chats,
            'activeChat' => $activeChatData,
        ]);
    }

    public function storeMessage(Request $request, Chat $chat)
    {
        $user = auth()->user();

        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        $validated = $request->validate([
            'content' => 'nullable|string|max:5000',
            'photo' => 'nullable|image|max:5120',
            'video' => 'nullable|mimes:mp4,avi,mov,wmv,flv,webm|max:51200',
            'document' => 'nullable|file|max:10240',
        ]);

        if (
            empty($validated['content'])
            && ! $request->hasFile('photo')
            && ! $request->hasFile('video')
            && ! $request->hasFile('document')
        ) {
            return redirect()->back();
        }

        $imagePath = null;
        $videoPath = null;
        $filePath = null;

        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('chat-photos', 'public');
        } elseif ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('chat-videos', 'public');
        } elseif ($request->hasFile('document')) {
            $filePath = $request->file('document')->store('chat-files', 'public');
        }

        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => $validated['content'] ?? '',
            'image_path' => $imagePath,
            'video_path' => $videoPath,
            'file_path' => $filePath,
        ]);

        $chat->touch();

        event(new \App\Events\MessageSent($user, $message));

        return redirect()->route('chat', $chat);
    }

    public function updateMessage(Request $request, Chat $chat, Message $message)
    {
        $user = auth()->user();

        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        if ($message->user_id !== $user->id) {
            abort(403, 'Вы можете редактировать только свои сообщения.');
        }

        $validated = $request->validate([
            'content' => 'nullable|string|max:5000',
            'photo' => 'nullable|image|max:5120',
            'video' => 'nullable|mimes:mp4,avi,mov,wmv,flv,webm|max:51200',
            'document' => 'nullable|file|max:10240',
        ]);

        $imagePath = $message->image_path;
        $videoPath = $message->video_path;
        $filePath = $message->file_path;

        if ($request->hasFile('photo')) {
            if ($message->image_path && Storage::disk('public')->exists($message->image_path)) {
                Storage::disk('public')->delete($message->image_path);
            }
            if ($message->video_path && Storage::disk('public')->exists($message->video_path)) {
                Storage::disk('public')->delete($message->video_path);
                $videoPath = null;
            }
            if ($message->file_path && Storage::disk('public')->exists($message->file_path)) {
                Storage::disk('public')->delete($message->file_path);
                $filePath = null;
            }
            $imagePath = $request->file('photo')->store('chat-photos', 'public');
        } elseif ($request->hasFile('video')) {
            if ($message->video_path && Storage::disk('public')->exists($message->video_path)) {
                Storage::disk('public')->delete($message->video_path);
            }
            if ($message->image_path && Storage::disk('public')->exists($message->image_path)) {
                Storage::disk('public')->delete($message->image_path);
                $imagePath = null;
            }
            if ($message->file_path && Storage::disk('public')->exists($message->file_path)) {
                Storage::disk('public')->delete($message->file_path);
                $filePath = null;
            }
            $videoPath = $request->file('video')->store('chat-videos', 'public');
        } elseif ($request->hasFile('document')) {
            if ($message->file_path && Storage::disk('public')->exists($message->file_path)) {
                Storage::disk('public')->delete($message->file_path);
            }
            if ($message->image_path && Storage::disk('public')->exists($message->image_path)) {
                Storage::disk('public')->delete($message->image_path);
                $imagePath = null;
            }
            if ($message->video_path && Storage::disk('public')->exists($message->video_path)) {
                Storage::disk('public')->delete($message->video_path);
                $videoPath = null;
            }
            $filePath = $request->file('document')->store('chat-files', 'public');
        }

        $message->update([
            'content' => $validated['content'] ?? $message->content,
            'image_path' => $imagePath,
            'video_path' => $videoPath,
            'file_path' => $filePath,
        ]);

        event(new \App\Events\MessageUpdated($user, $message));

        return redirect()->route('chat', $chat);
    }

    public function deleteMessage(Chat $chat, Message $message)
    {
        $user = auth()->user();
        $messageId = $message->id;
        $chatId = $chat->id;

        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        if ($message->user_id !== $user->id) {
            abort(403, 'Вы можете удалять только свои сообщения.');
        }

        if ($message->image_path && Storage::disk('public')->exists($message->image_path)) {
            Storage::disk('public')->delete($message->image_path);
        }
        if ($message->video_path && Storage::disk('public')->exists($message->video_path)) {
            Storage::disk('public')->delete($message->video_path);
        }
        if ($message->file_path && Storage::disk('public')->exists($message->file_path)) {
            Storage::disk('public')->delete($message->file_path);
        }

        $message->delete();

        event(new \App\Events\MessageDeleted($messageId, $chatId));

        return redirect()->route('chat', $chat);
    }
}
