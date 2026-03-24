<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request)
    {
        $user = $request->user();

        $unreadNotificationsCount = 0;
        $unreadChatsCount = 0;

        if ($user) {
            $unreadNotificationsCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();

            $chats = $user->chats()->withPivot('last_read_at')->get();
            $totalUnread = 0;

            foreach ($chats as $chat) {
                $lastReadAt = $chat->pivot?->last_read_at ?? $user->created_at;
                $unread = $chat->messages()
                    ->where('user_id', '!=', $user->id)
                    ->where('created_at', '>', $lastReadAt)
                    ->count();
                $totalUnread += $unread;
            }

            $unreadChatsCount = $totalUnread;
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'is_admin' => $user->is_admin ?? false,
                    'balance' => $user->balance ?? 0,
                    'profile_url' => '/profile',
                    'unreadNotificationsCount' => $unreadNotificationsCount,
                    'unreadChatsCount' => $unreadChatsCount,
                ] : null,
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
            ],
        ]);
    }
}
