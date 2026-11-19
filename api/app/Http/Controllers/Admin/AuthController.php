<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $r)
    {
        $d = $r->validate(['email' => 'required|email', 'password' => 'required|string']);
        $key = 'login:' . Str::lower($d['email']) . '|' . $r->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw new ApiError('too_many_attempts', 'Too many tries. Wait a minute and try again.', 429);
        }
        $u = User::where('email', Str::lower($d['email']))->first();
        if (!$u || !Hash::check($d['password'], $u->password) || !$u->active) {
            RateLimiter::hit($key, 60);
            throw new ApiError('invalid_login', 'Email or password is wrong.', 422, ['email' => 'Email or password is wrong.']);
        }
        RateLimiter::clear($key);
        $u->forceFill(['last_login_at' => now()])->save();
        $token = $u->createToken('admin', ['*'], now()->addDays(14))->plainTextToken;
        $r->setUserResolver(fn () => $u);
        Audit::log('login', "user:{$u->id}");
        return ['token' => $token, 'user' => self::me($u)];
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return ['ok' => true];
    }

    public function show(Request $r)
    {
        return ['user' => self::me($r->user())];
    }

    public function forgot(Request $r)
    {
        $r->validate(['email' => 'required|email']);
        Password::sendResetLink(['email' => Str::lower($r->email)]);
        return ['ok' => true]; // same answer whether or not the email exists
    }

    public function reset(Request $r)
    {
        $d = $r->validate(['email' => 'required|email', 'token' => 'required', 'password' => 'required|string|min:10']);
        $status = Password::reset($d, function (User $u, string $pw) {
            $u->forceFill(['password' => $pw])->save();
            $u->tokens()->delete();
        });
        if ($status !== Password::PASSWORD_RESET) throw new ApiError('reset_failed', 'This reset link is not valid any more.', 422);
        return ['ok' => true];
    }

    public function password(Request $r)
    {
        $d = $r->validate(['current' => 'required|string', 'password' => 'required|string|min:10']);
        if (!Hash::check($d['current'], $r->user()->password)) throw ApiError::fields(['current' => 'Current password is wrong.']);
        $r->user()->forceFill(['password' => $d['password']])->save();
        Audit::log('password_changed', "user:{$r->user()->id}");
        return ['ok' => true];
    }

    public static function me(User $u): array
    {
        return ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role];
    }
}
