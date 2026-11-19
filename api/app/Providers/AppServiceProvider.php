<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

use Illuminate\Support\ServiceProvider;

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
        // Public endpoints the website calls (per visitor IP)
        RateLimiter::for('leads', fn (Request $r) => [Limit::perMinute(3)->by($r->ip()), Limit::perDay(20)->by($r->ip())]);
        // Reset / invite links open the admin, not this API
        ResetPassword::createUrlUsing(fn ($user, string $token) => rtrim((string) config('content.admin_url'), '/') . '/reset?token=' . $token . '&email=' . urlencode($user->email));
        RateLimiter::for('events', fn (Request $r) => Limit::perMinute(120)->by($r->ip()));
    }
}
