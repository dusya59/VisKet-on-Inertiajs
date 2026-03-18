<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        $socialiteUser = Socialite::driver($provider)->user();

        $user = User::where('email', $socialiteUser->getEmail())->first();

        if (! $user) {
            $user = User::create([
                'name' => $socialiteUser->getName() ?? $socialiteUser->getNickname() ?? 'User',
                'email' => $socialiteUser->getEmail(),
                'provider' => $provider,
                'provider_id' => $socialiteUser->getId(),
                'avatar' => $socialiteUser->getAvatar(),
            ]);
        } elseif (! $user->provider) {
            $user->update([
                'provider' => $provider,
                'provider_id' => $socialiteUser->getId(),
            ]);
        }

        Auth::login($user);

        return redirect('/profile');
    }
}
