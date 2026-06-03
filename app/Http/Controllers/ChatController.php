<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\Message;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->withPivot('last_read_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Chat $chat) use ($user) {
                $otherUser = $chat->users->first();

                $lastReadAt = $chat->pivot?->last_read_at ?? $user->created_at;
                $unreadCount = $chat->messages()
                    ->where('user_id', '!=', $user->id)
                    ->where('created_at', '>', $lastReadAt)
                    ->count();

                return [
                    'id' => $chat->id,
                    'latest_message' => $chat->messages->first()
                        ? [
                            'content' => $chat->messages->first()->content,
                            'created_at_human' => $chat->messages->first()->created_at->diffForHumans(),
                            'is_mine' => $chat->messages->first()->user_id === $user->id,
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

        $user->chats()->syncWithoutDetaching([$chat->id => ['last_read_at' => now()->utc()->format('Y-m-d H:i:s')]]);

        $now = now()->utc();
        event(new \App\Events\MessagesRead($chat->id, $user->id, $now));

        $pivotData = DB::table('chat_user')
            ->where('chat_id', $chat->id)
            ->where('user_id', $user->id)
            ->first();
        $lastReadAt = $pivotData?->last_read_at
            ? \Carbon\Carbon::parse($pivotData->last_read_at)->toIso8601String()
            : null;

        $otherUser = $chat->users()->where('user_id', '!=', $user->id)->first();
        $otherLastReadAt = null;
        if ($otherUser) {
            $otherPivot = DB::table('chat_user')
                ->where('chat_id', $chat->id)
                ->where('user_id', $otherUser->id)
                ->first();
            $otherLastReadAt = $otherPivot?->last_read_at
                ? \Carbon\Carbon::parse($otherPivot->last_read_at)->toIso8601String()
                : null;
        }

        $activeChat = $chat->load([
            'users',
            'application.user',
            'application.vacancy',
            'application.vacancy.post',
            'application.transaction',
            'application.dispute',
        ]);

        $messages = $chat->messages()
            ->visibleFor($user)
            ->with('user', 'replyTo.user')
            ->orderBy('created_at')
            ->get();

        $chats = $user->chats()
            ->with(['users' => fn ($q) => $q->where('id', '!=', $user->id)])
            ->with(['messages' => fn ($q) => $q->visibleFor($user)->latest()->limit(1)])
            ->withCount('messages')
            ->withPivot('last_read_at')
            ->orderByDesc('updated_at')
            ->get()
            ->map(function (Chat $c) use ($user) {
                $otherUser = $c->users->first();

                $lastReadAt = $c->pivot?->last_read_at ?? $user->created_at;
                $unreadCount = $c->messages()
                    ->visibleFor($user)
                    ->where('user_id', '!=', $user->id)
                    ->where('created_at', '>', $lastReadAt)
                    ->count();

                return [
                    'id' => $c->id,
                    'latest_message' => $c->messages->first()
                        ? [
                            'content' => $c->messages->first()->content,
                            'created_at_human' => $c->messages->first()->created_at->diffForHumans(),
                            'is_mine' => $c->messages->first()->user_id === $user->id,
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

        $applicationData = null;
        if ($chat->application) {
            $app = $chat->application;
            $applicationData = [
                'id' => $app->id,
                'cover_letter' => $app->cover_letter,
                'proposed_price' => $app->proposed_price,
                'status' => $app->status,
                'created_at' => $app->created_at->toISOString(),
                'executor_marked_completed_at' => $app->executor_marked_completed_at?->toISOString(),
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
                    'user_id' => $app->vacancy->post?->user_id,
                ] : null,
                'transaction' => $app->transaction ? [
                    'id' => $app->transaction->id,
                    'status' => $app->transaction->status,
                    'amount' => $app->transaction->amount,
                    'completed_at' => $app->transaction->completed_at?->toISOString(),
                ] : null,
                'dispute' => $app->dispute ? [
                    'id' => $app->dispute->id,
                    'status' => $app->dispute->status,
                    'reason' => $app->dispute->reason,
                    'resolution' => $app->dispute->resolution,
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
            'messages' => $messages->map(function ($m) {
                return [
                    'id' => $m->id,
                    'content' => $m->content,
                    'image_url' => $m->image_path ? asset('storage/'.$m->image_path) : null,
                    'video_url' => $m->video_path ? asset('storage/'.$m->video_path) : null,
                    'file_url' => $m->file_path ? asset('storage/'.$m->file_path) : null,
                    'file_name' => $m->original_file_name ?? ($m->file_path ? basename($m->file_path) : null),
                    'file_size' => $m->file_path ? Storage::disk('public')->size($m->file_path) : null,
                    'is_system' => $m->is_system,
                    'is_price_proposal' => $m->is_price_proposal,
                    'proposed_price' => $m->proposed_price,
                    'price_proposal_status' => $m->price_proposal_status,
                    'reply_to' => $m->reply_to_id && $m->replyTo ? [
                        'id' => $m->replyTo->id,
                        'content' => $m->replyTo->content,
                        'user' => [
                            'id' => $m->replyTo->user->id,
                            'name' => $m->replyTo->user->name,
                        ],
                    ] : null,
                    'user' => [
                        'id' => $m->user->id,
                        'name' => $m->user->name,
                        'avatar_url' => $m->user->avatar
                            ? asset('storage/'.$m->user->avatar)
                            : asset('images/User-avatar.png'),
                    ],
                    'time' => $m->created_at->setTimezone('Asia/Yekaterinburg')->format('H:i'),
                    'created_at' => $m->created_at->toIso8601String(),
                    'is_mine' => $m->user_id === auth()->id(),
                ];
            }),
            'last_read_at' => $lastReadAt,
            'other_last_read_at' => $otherLastReadAt,
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
            'reply_to_id' => 'nullable|exists:messages,id',
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
        $originalFileName = null;

        if ($request->hasFile('photo')) {
            $imagePath = $request->file('photo')->store('chat-photos', 'public');
        } elseif ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('chat-videos', 'public');
        } elseif ($request->hasFile('document')) {
            $filePath = $request->file('document')->store('chat-files', 'public');
            $originalFileName = $request->input('file_name') ?? $request->file('document')->getClientOriginalName();
        }

        $message = Message::create([
            'chat_id' => $chat->id,
            'user_id' => $user->id,
            'content' => $validated['content'] ?? '',
            'image_path' => $imagePath,
            'video_path' => $videoPath,
            'file_path' => $filePath,
            'original_file_name' => $originalFileName,
            'reply_to_id' => $validated['reply_to_id'] ?? null,
        ]);

        $chat->touch();

        $recipientId = $chat->users()->where('user_id', '!=', $user->id)->first()->id;
        $recipient = User::find($recipientId);

        if ($recipient) {
            $preview = $validated['content'] ?? ($imagePath ? 'изображение' : ($videoPath ? 'видео' : 'файл'));
            if (strlen($preview) > 50) {
                $preview = mb_substr($preview, 0, 50).'...';
            }

            Notification::create([
                'user_id' => $recipient->id,
                'type' => 'message',
                'title' => 'Новое сообщение',
                'content' => $user->name.': '.$preview,
                'link' => '/chats/'.$chat->id,
            ]);
        }

        event(new \App\Events\MessageSent($user, $message));

        return redirect()->back();
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
        $originalFileName = $message->original_file_name;

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
                $originalFileName = null;
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
                $originalFileName = null;
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
            $originalFileName = $request->input('file_name') ?? $request->file('document')->getClientOriginalName();
        }

        $message->update([
            'content' => $validated['content'] ?? $message->content,
            'image_path' => $imagePath,
            'video_path' => $videoPath,
            'file_path' => $filePath,
            'original_file_name' => $originalFileName,
        ]);

        event(new \App\Events\MessageUpdated($user, $message));

        return redirect()->back();
    }

    public function deleteMessage(Request $request, Chat $chat, Message $message)
    {
        $user = auth()->user();

        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        if ($message->user_id !== $user->id) {
            abort(403, 'Вы можете удалять только свои сообщения.');
        }

        $mode = $request->input('mode', 'me');

        if ($mode === 'everyone') {
            $message->update([
                'deleted_for_everyone' => true,
                'deleted_by_id' => $user->id,
                'hidden_at' => now(),
            ]);

            event(new \App\Events\MessageDeleted($message->id, $chat->id));
        } else {
            $ids = $message->deleted_for_user_ids ?? [];
            $ids[] = $user->id;
            $message->update([
                'deleted_for_user_ids' => array_values(array_unique($ids)),
                'hidden_at' => now(),
            ]);
        }

        return redirect()->back();
    }

    public function deleteMessagesBulk(Request $request, Chat $chat)
    {
        $user = auth()->user();

        if (! $chat->users->contains($user->id)) {
            abort(403, 'У вас нет доступа к этому чату.');
        }

        $ids = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer',
        ])['ids'];

        $mode = $request->input('mode', 'me');

        $messages = Message::where('chat_id', $chat->id)
            ->whereIn('id', $ids)
            ->get();

        foreach ($messages as $message) {
            if ($mode === 'everyone') {
                if ($message->user_id !== $user->id) {
                    continue;
                }

                $message->update([
                    'deleted_for_everyone' => true,
                    'deleted_by_id' => $user->id,
                    'hidden_at' => now(),
                ]);

                event(new \App\Events\MessageDeleted($message->id, $chat->id));
            } else {
                $userIds = $message->deleted_for_user_ids ?? [];
                $userIds[] = $user->id;
                $message->update([
                    'deleted_for_user_ids' => array_values(array_unique($userIds)),
                    'hidden_at' => now(),
                ]);
            }
        }

        $chat->touch();

        return redirect()->back();
    }

    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return Inertia::render('Chat/Chats', [
                'chats' => [],
                'activeChat' => null,
                'searchResults' => [],
            ]);
        }

        $user = auth()->user();
        $queryLower = mb_strtolower($query);

        $chatResults = Chat::query()
            ->whereHas('users', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->whereHas('users', function ($q) use ($queryLower) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$queryLower}%"]);
            })
            ->with(['users' => fn ($q) => $q->where('id', '!=', $user->id)])
            ->limit(10)
            ->get()
            ->map(function ($chat) {
                $otherUser = $chat->users->first();

                return [
                    'type' => 'chat',
                    'chatId' => $chat->id,
                    'user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'avatar_url' => $otherUser->avatar
                            ? asset('storage/'.$otherUser->avatar)
                            : asset('images/User-avatar.png'),
                    ],
                    'content' => $otherUser->name,
                    'isUserMatch' => true,
                ];
            })->values()->all();

        $messageResults = Message::query()
            ->whereRaw('LOWER(content) LIKE ?', ["%{$queryLower}%"])
            ->whereHas('chat', function ($q) use ($user) {
                $q->whereHas('users', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
            })
            ->with(['user', 'chat.users' => fn ($q) => $q->where('id', '!=', auth()->id())])
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($message) {
                $otherUser = $message->chat->users->first();

                return [
                    'type' => 'message',
                    'chatId' => $message->chat_id,
                    'messageId' => $message->id,
                    'user' => [
                        'id' => $otherUser->id ?? $message->user_id,
                        'name' => $message->user->name ?? 'Пользователь',
                        'avatar_url' => $message->user->avatar
                            ? asset('storage/'.$message->user->avatar)
                            : asset('images/User-avatar.png'),
                    ],
                    'content' => $message->content,
                    'isUserMatch' => false,
                    'created_at' => $message->created_at->toIso8601String(),
                ];
            })->values()->all();

        $results = array_merge($chatResults, $messageResults);

        return Inertia::render('Chat/Chats', [
            'chats' => [],
            'activeChat' => null,
            'searchResults' => $results,
        ]);
    }
}
