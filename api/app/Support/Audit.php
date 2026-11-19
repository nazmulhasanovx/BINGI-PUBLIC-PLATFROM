<?php

namespace App\Support;

use App\Models\AuditLog;

class Audit
{
    /** Record who did what. Never store secrets or passwords in before/after. */
    public static function log(string $action, string $entity, mixed $before = null, mixed $after = null): void
    {
        $req = request();
        AuditLog::create([
            'user_id' => $req?->user()?->id,
            'action' => $action,
            'entity' => $entity,
            'before' => $before,
            'after' => $after,
            'ip' => $req?->ip(),
            'at' => now(),
        ]);
    }
}
