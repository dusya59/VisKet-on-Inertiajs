<?php

namespace App\Providers;

use App\Events\ApplicationStatusChanged;
use App\Listeners\SendApplicationStatusNotification;
use App\Listeners\SendDisputeResolvedNotification;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::shouldBeStrict(! app()->isProduction() && ! app()->runningUnitTests());

        if (app()->isProduction()) {
            URL::forceScheme('https');
        }

        RateLimiter::for('global', function ($request) {
            return Limit::perMinute(60)->by($request->ip());
        });

        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });

        Inertia::share([
            'auth' => function () {
                $user = auth()->user();

                return [
                    'user' => $user ? [
                        'id' => $user->id,
                        'name' => $user->name,
                        'is_admin' => $user->is_admin,
                        'balance' => $user->balance,
                        'hasPendingTransactions' => $user->hasPendingTransactions(),
                        'profile_url' => route('profile', $user),
                    ] : null,
                ];
            },
        ]);

        Event::listen(
            ApplicationStatusChanged::class,
            SendApplicationStatusNotification::class,
        );

        Event::listen(
            ApplicationStatusChanged::class,
            SendDisputeResolvedNotification::class,
        );
    }
}
