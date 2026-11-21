<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Roles with per-module access (none / view / edit). Modules + default roles: packages/content/modules.json.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $t) {
            $t->id();
            $t->string('key', 40)->unique();     // users.role points here
            $t->json('name');                     // { bn, en }
            $t->json('permissions');              // { "M03": "edit", "M04": "view", … } — missing = no access
            $t->boolean('system')->default(false); // owner: always full access, cannot be changed
            $t->timestamps();
        });
        $file = config('content.modules');
        $defaults = json_decode(file_get_contents($file), true)['defaultRoles'];
        foreach ($defaults as $r) {
            DB::table('roles')->insert(['key' => $r['key'], 'name' => json_encode($r['name'], JSON_UNESCAPED_UNICODE), 'permissions' => json_encode($r['permissions']),
                'system' => $r['system'], 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
