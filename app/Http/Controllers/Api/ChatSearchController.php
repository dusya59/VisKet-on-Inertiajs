<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;

class ChatSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
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
            });

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
            });

        $results = $chatResults->merge($messageResults);

        return response()->json($results->values());
    }
}
