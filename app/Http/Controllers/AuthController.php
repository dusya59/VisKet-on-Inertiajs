<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AuthController extends Controller
{
    private $registerMessages = [
        'name.required' => 'Имя обязательно для заполнения.',
        'name.string' => 'Имя должно быть строкой.',
        'name.max' => 'Имя не должно превышать 64 символов.',
        'name.unique' => 'Это имя пользователя уже занято.',
        'email.required' => 'Email обязателен для заполнения.',
        'email.email' => 'Введите корректный email адрес.',
        'email.unique' => 'Этот email уже зарегистрирован.',
        'password.required' => 'Пароль обязателен для заполнения.',
        'password.string' => 'Пароль должен быть строкой.',
        'password.min' => 'Пароль должен содержать минимум 8 символов.',
        'password.confirmed' => 'Пароли не совпадают.',
    ];

    public function showLoginForm()
    {
        return Inertia::render('Auth/Auth', [
            'skills' => Skill::all(),
        ]);
    }

    public function showRegisterForm()
    {
        return Inertia::render('Auth/Auth', [
            'skills' => Skill::all(),
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:64|unique:users',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'avatar' => 'nullable|image|max:2048',
            'bio' => 'nullable|string|max:1000',
            'skills' => 'nullable|array',
            'skills.*.id' => 'exists:skills,id',
            'phone' => 'nullable|string|max:20',
            'resume' => 'nullable|file|max:10240',
            'passport' => 'nullable|file|max:10240',
            'certificates' => 'nullable|file|max:10240',
            'email_confirmed' => 'nullable|boolean',
            'request_verification' => 'nullable|boolean',
        ], $this->registerMessages);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'avatar' => $avatarPath,
            'aboutme' => $request->bio ?? null,
            'phone' => $request->phone ?? null,
            'is_verified' => $request->boolean('request_verification') ? 'pending' : null,
        ]);

        $user->refresh();

        if (! empty($request->skills)) {
            $skills = collect($request->skills)->mapWithKeys(function ($skill) {
                return [$skill['id'] => ['level' => $skill['level'] ?? 3]];
            })->toArray();
            $user->skills()->attach($skills);
        }

        if ($request->hasFile('resume')) {
            Storage::disk('public')->put('users/'.$user->id.'/resume.'.$request->file('resume')->getClientOriginalExtension(), file_get_contents($request->file('resume')));
        }

        if ($request->hasFile('passport')) {
            Storage::disk('public')->put('users/'.$user->id.'/passport.'.$request->file('passport')->getClientOriginalExtension(), file_get_contents($request->file('passport')));
        }

        if ($request->hasFile('certificates')) {
            Storage::disk('public')->put('users/'.$user->id.'/certificates.'.$request->file('certificates')->getClientOriginalExtension(), file_get_contents($request->file('certificates')));
        }

        Auth::login($user);
        $request->session()->regenerate();

        Log::info('User registered', ['user_id' => $user->id, 'email' => $user->email]);

        return redirect()->route('profile', ['user' => $user->id]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            Log::info('User logged in', ['user_id' => Auth::id(), 'email' => $credentials['email']]);

            return redirect()->intended('/');
        }

        Log::warning('Login failed', ['email' => $credentials['email'], 'ip' => $request->ip()]);

        return back()->withErrors([
            'email' => 'Неверный email или пароль.',
        ]);
    }

    public function logout(Request $request)
    {
        $userId = Auth::id();

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Log::info('User logged out', ['user_id' => $userId]);

        return redirect('/');
    }
}
