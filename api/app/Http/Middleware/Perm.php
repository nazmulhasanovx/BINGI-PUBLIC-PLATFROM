<?php

namespace App\Http\Middleware;

use App\Content\Permissions;
use App\Support\ApiError;
use Closure;
use Illuminate\Http\Request;

/** route()->middleware('perm:M03,edit') — module access from the user's role (Users & roles screen). */
class Perm
{
    public function handle(Request $request, Closure $next, string $module, string $level = 'view')
    {
        $u = $request->user();
        if (!$u || ($u->active ?? true) === false) throw new ApiError('unauthenticated', 'Please sign in again.', 401);
        if (!Permissions::can($u, $module, $level)) throw new ApiError('forbidden', 'Your role cannot do this.', 403);
        return $next($request);
    }
}
