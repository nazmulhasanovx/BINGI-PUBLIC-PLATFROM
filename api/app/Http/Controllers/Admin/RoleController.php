<?php

namespace App\Http\Controllers\Admin;

use App\Content\Permissions;
use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use App\Support\ApiError;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Roles = a name + module access (none / view / edit). The owner role is fixed. */
class RoleController extends Controller
{
    public function modules()
    {
        return ['modules' => array_values(Permissions::modules())];
    }

    public function index()
    {
        $counts = User::selectRaw('role, count(*) n')->groupBy('role')->pluck('n', 'role');
        return ['items' => Role::orderByDesc('system')->orderBy('id')->get()->map(fn ($r) => $r->toArray() + ['users' => $counts[$r->key] ?? 0])];
    }

    public function store(Request $r)
    {
        $d = $this->valid($r);
        $key = Str::slug($d['name']['en'] ?: $d['name']['bn'], '_') ?: 'role';
        $base = $key; $i = 2;
        while (Role::where('key', $key)->exists()) $key = $base . '_' . $i++;
        $role = Role::create(['key' => $key, 'name' => $d['name'], 'permissions' => $d['permissions'], 'system' => false]);
        Permissions::flush();
        Audit::log('created', "role:{$role->key}", null, $d);
        return response(['item' => $role], 201);
    }

    public function update(Request $r, Role $role)
    {
        if ($role->system) throw new ApiError('system_role', 'The owner role always has full access and cannot be changed.', 409);
        $d = $this->valid($r);
        $before = $role->only(['name', 'permissions']);
        $role->update($d);
        Permissions::flush();
        Audit::log('updated', "role:{$role->key}", $before, $d);
        return ['item' => $role];
    }

    public function destroy(Role $role)
    {
        if ($role->system) throw new ApiError('system_role', 'The owner role cannot be deleted.', 409);
        if (User::where('role', $role->key)->exists()) throw new ApiError('role_in_use', 'Move the users of this role to another role first.', 409);
        Audit::log('deleted', "role:{$role->key}", $role->toArray());
        $role->delete();
        return ['ok' => true];
    }

    /** Name in both languages; permissions only for known modules and their allowed levels. */
    private function valid(Request $r): array
    {
        $d = $r->validate(['name' => 'required|array', 'name.bn' => 'required|string|max:60', 'name.en' => 'required|string|max:60', 'permissions' => 'present|array']);
        $mods = Permissions::modules();
        $perm = [];
        foreach ($d['permissions'] as $id => $lvl) {
            if ($lvl === 'none' || $lvl === null) continue;
            if (!isset($mods[$id])) throw ApiError::fields(["permissions.$id" => 'Unknown module.']);
            if (!in_array($lvl, $mods[$id]['levels'], true)) throw ApiError::fields(["permissions.$id" => "This module allows: " . implode(', ', $mods[$id]['levels']) . '.']);
            $perm[$id] = $lvl;
        }
        return ['name' => $d['name'], 'permissions' => (object) $perm];
    }
}
