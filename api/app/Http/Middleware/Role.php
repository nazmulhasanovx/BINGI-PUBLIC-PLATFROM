<?php

namespace App\Http\Middleware;

use App\Support\ApiError;
use Closure;
use Illuminate\Http\Request;

/** route()->middleware('role:owner,editor') */
class Role
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $u = $request->user();
        if (!$u || ($u->active ?? true) === false) throw new ApiError('unauthenticated', 'Please sign in again.', 401);
        if (!$u->hasRole(...$roles)) throw new ApiError('forbidden', 'Your role cannot do this.', 403);
        return $next($request);
    }
}
