<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return ['items' => User::orderBy('name')->get(['id', 'name', 'email', 'role', 'active', 'last_login_at', 'created_at'])];
    }

    /** Invite: creates the user with a random password and emails a "set your password" link. */
    public function store(Request $r)
    {
        $r->merge(['email' => Str::lower((string) $r->input('email'))]);
        $d = $r->validate(['name' => 'required|string|max:120', 'email' => 'required|email|unique:users,email', 'role' => ['required', Rule::in(User::ROLES)]]);
        $u = User::create(array_merge($d, ['email' => Str::lower($d['email']), 'password' => Str::random(40)]));
        Password::sendResetLink(['email' => $u->email]);
        Audit::log('invited', "user:{$u->id}", null, $d);
        return response(['item' => $u->only(['id', 'name', 'email', 'role', 'active'])], 201);
    }

    public function update(Request $r, User $user)
    {
        $d = $r->validate(['name' => 'sometimes|string|max:120', 'role' => ['sometimes', Rule::in(User::ROLES)], 'active' => 'sometimes|boolean']);
        $losingOwner = $user->role === 'owner' && ((isset($d['role']) && $d['role'] !== 'owner') || (isset($d['active']) && !$d['active']));
        if ($losingOwner && User::where('role', 'owner')->where('active', true)->count() <= 1) {
            throw new ApiError('last_owner', 'There must always be at least one active owner.', 409);
        }
        $before = $user->only(array_keys($d));
        $user->update($d);
        if (isset($d['active']) && !$d['active']) $user->tokens()->delete();
        Audit::log('updated', "user:{$user->id}", $before, $d);
        return ['item' => $user->only(['id', 'name', 'email', 'role', 'active'])];
    }
}
