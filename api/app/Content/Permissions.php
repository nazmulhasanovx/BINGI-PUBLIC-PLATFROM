<?php

namespace App\Content;

use App\Models\Role;
use App\Models\User;

/**
 * Module access per role: none / view / edit. Modules are listed in packages/content/modules.json.
 * The owner role (system) always has full access. Every API route and content type maps to one module.
 */
class Permissions
{
    private static ?array $modules = null;
    private static array $cache = [];

    public static function modules(): array
    {
        return self::$modules ??= collect(json_decode(file_get_contents(config('content.modules')), true)['modules'])->keyBy('id')->all();
    }

    /** 'none' | 'view' | 'edit' */
    public static function level(User $u, string $module): string
    {
        $map = self::map($u);
        return $map[$module] ?? 'none';
    }

    public static function can(User $u, string $module, string $need = 'view'): bool
    {
        $have = self::level($u, $module);
        return $need === 'view' ? in_array($have, ['view', 'edit'], true) : $have === 'edit';
    }

    /** Effective map for a user, e.g. { M02: view, M03: edit }. */
    public static function map(User $u): array
    {
        $key = $u->role;
        if (isset(self::$cache[$key])) return self::$cache[$key];
        $role = Role::where('key', $key)->first();
        if (!$role) return self::$cache[$key] = [];
        if ($role->system) return self::$cache[$key] = collect(self::modules())->map(fn ($m) => end($m['levels']))->all();
        $out = [];
        foreach ($role->permissions ?? [] as $id => $lvl) {
            $m = self::modules()[$id] ?? null;
            if ($m && in_array($lvl, $m['levels'], true)) $out[$id] = $lvl;
        }
        $out['M02'] = 'view'; // everyone who can sign in sees the dashboard
        return self::$cache[$key] = $out;
    }

    public static function flush(): void
    {
        self::$cache = [];
    }
}
