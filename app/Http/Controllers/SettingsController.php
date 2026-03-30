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

    public function files()
    {
        $user = auth()->user();

        $userFiles = [];

        if ($user->resume) {
            $userFiles[] = [
                'type' => 'resume',
                'name' => 'Резюме',
                'path' => $user->resume,
                'url' => asset('storage/'.$user->resume),
            ];
        }

        if ($user->passport) {
            $userFiles[] = [
                'type' => 'passport',
                'name' => 'Паспорт',
                'path' => $user->passport,
                'url' => asset('storage/'.$user->passport),
            ];
        }

        if ($user->certificates) {
            $userFiles[] = [
                'type' => 'certificates',
                'name' => 'Сертификаты',
                'path' => $user->certificates,
                'url' => asset('storage/'.$user->certificates),
            ];
        }

        return Inertia::render('Settings/Index', [
            'section' => 'files',
            'user' => $user,
            'userFiles' => $userFiles,
        ]);
    }

    public function requestVerification()
    {
        $user = auth()->user();

        if ($user->is_verified === 'verified') {
            return response()->json(['error' => 'Account already verified'], 400);
        }

        if ($user->is_verified === 'pending') {
            return response()->json(['error' => 'Verification already pending'], 400);
        }

        $user->is_verified = 'pending';
        $user->save();

        return response()->json(['success' => true, 'message' => 'Verification request sent']);
    }

    public function resendEmailVerification()
    {
        $user = auth()->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['error' => 'Email already verified'], 400);
        }

        $user->sendEmailVerificationNotification();

        return response()->json(['success' => true, 'message' => 'Verification email sent']);
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
