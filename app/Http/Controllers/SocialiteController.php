<?php

namespace App\Http\Controllers;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class SocialiteController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(Request $request, string $provider)
    {
        try {
            $socialiteUser = Socialite::driver($provider)->user();
            $email = $socialiteUser->getEmail();

            $socialAccount = SocialAccount::where('provider', $provider)
                ->where('provider_id', $socialiteUser->getId())
                ->first();

            if ($socialAccount) {
                $user = $socialAccount->user;

                Log::info('Social login: existing account', [
                    'provider' => $provider,
                    'user_id' => $user->id,
                ]);
            } else {
                $user = $email ? User::where('email', $email)->first() : null;

                if ($user) {
                    $user->socialAccounts()->create([
                        'provider' => $provider,
                        'provider_id' => $socialiteUser->getId(),
                        'token' => $socialiteUser->token,
                        'refresh_token' => $socialiteUser->refreshToken ?? null,
                    ]);

                    Log::info('Social login: linked to existing user', [
                        'provider' => $provider,
                        'user_id' => $user->id,
                        'email' => $email,
                    ]);
                } else {
                    $user = User::create([
                        'name' => $socialiteUser->getName() ?? $socialiteUser->getNickname() ?? 'User',
                        'email' => $email,
                        'password' => null,
                    ]);

                    $user->socialAccounts()->create([
                        'provider' => $provider,
                        'provider_id' => $socialiteUser->getId(),
                        'token' => $socialiteUser->token,
                        'refresh_token' => $socialiteUser->refreshToken ?? null,
                    ]);

                    Log::info('Social login: new user created', [
                        'provider' => $provider,
                        'user_id' => $user->id,
                        'email' => $email,
                    ]);
                }
            }

            Auth::login($user, true);

            return redirect('/profile/' . $user->id);

        } catch (Exception $e) {
            Log::error('Socialite callback error', [
                'provider' => $provider,
                'message' => $e->getMessage(),
            ]);

            return redirect()->route('login')
                ->with('error', 'Ошибка входа через ' . $provider . '. Попробуйте снова.');
        }
    }
}