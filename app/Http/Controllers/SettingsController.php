<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return redirect()->route('settings.profile');
    }

    public function profile()
    {
        $user = auth()->user();
        $skills = Skill::all();

        $userSkills = $user->skills->map(function ($skill) {
            return [
                'id' => $skill->id,
                'name' => $skill->name,
                'level' => $skill->pivot->level ?? 3,
            ];
        });

        return Inertia::render('Settings/Index', [
            'section' => 'profile',
            'user' => $user,
            'skills' => $skills,
            'userSkills' => $userSkills,
        ]);
    }

    public function privacy()
    {
        return Inertia::render('Settings/Index', [
            'section' => 'privacy',
            'user' => auth()->user(),
        ]);
    }

    public function notifications()
    {
        $user = auth()->user();

        $notifications = $user->notifications()
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'title' => $notification->title,
                    'content' => $notification->content,
                    'link' => $notification->link,
                    'is_read' => $notification->is_read,
                    'created_at' => $notification->created_at->diffForHumans(),
                    'created_at_full' => $notification->created_at->toISOString(),
                ];
            });

        $unreadCount = $user->unreadNotifications()->count();

        return Inertia::render('Settings/Notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request)
    {
        $user = auth()->user();

        if ($request->id) {
            $user->notifications()
                ->where('id', $request->id)
                ->update(['is_read' => true]);
        } elseif ($request->all) {
            $user->notifications()
                ->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }
}
