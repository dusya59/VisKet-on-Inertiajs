<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
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
        return Inertia::render('Auth/Login');
    }

    public function showRegisterForm()
    {
        return Inertia::render('Auth/Register');
    }

public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:64|unique:users',
        'email' => 'required|email|unique:users',
        'password' => 'required|string|min:8|confirmed'
    ], $this->registerMessages);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password)
    ]);

    Auth::login($user);
    $request->session()->regenerate();

    return redirect()->intended('/');
}

public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();
        return redirect()->intended('/');
    }

    return back()->withErrors([
        'email' => 'Неверный email или пароль.',
    ]);
}

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}