<?php

use App\Models\Role;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function roleUser(array $perms): User
{
    $role = Role::create(['key' => 'custom_' . uniqid(), 'name' => ['bn' => 'কাস্টম', 'en' => 'Custom'], 'permissions' => $perms]);
    \App\Content\Permissions::flush();
    $u = User::factory()->create(['role' => $role->key]);
    Sanctum::actingAs($u);
    return $u;
}

it('ships owner, editor and sales roles', function () {
    expect(Role::orderBy('id')->pluck('key')->all())->toBe(['owner', 'editor', 'sales']);
});

it('lets an owner build a role from modules and levels', function () {
    actAs('owner');
    $r = $this->postJson('/api/v1/roles', ['name' => ['bn' => 'ব্লগ লেখক', 'en' => 'Blog writer'], 'permissions' => ['M14' => 'edit', 'M19' => 'edit', 'M05' => 'view', 'M03' => 'none']])->assertCreated();
    expect($r->json('item.key'))->toBe('blog_writer')->and((array) $r->json('item.permissions'))->toBe(['M14' => 'edit', 'M19' => 'edit', 'M05' => 'view']);
    $this->postJson('/api/v1/roles', ['name' => ['bn' => 'ক', 'en' => 'X'], 'permissions' => ['M04' => 'edit']])->assertStatus(422)->assertJsonPath('fields', fn ($f) => isset($f['permissions.M04']));
    $this->postJson('/api/v1/roles', ['name' => ['bn' => 'ক', 'en' => 'Y'], 'permissions' => ['M99' => 'view']])->assertStatus(422);
});

it('gives a custom role exactly its modules — no more', function () {
    seedContent();
    roleUser(['M14' => 'edit', 'M05' => 'view']);
    $me = $this->getJson('/api/v1/auth/me')->json('user.permissions');
    expect((array) $me)->toBe(['M14' => 'edit', 'M05' => 'view', 'M02' => 'view']);
    expect(collect($this->getJson('/api/v1/types')->json('types'))->pluck('module')->unique()->values()->all())->toBe(['M14']);
    $post = \App\Models\Entry::where('type', 'blog_post')->first();
    $this->patchJson("/api/v1/entries/blog_post/{$post->id}", ['data' => array_replace($post->data, ['date' => '2026-12-01'])])->assertOk();
    $this->getJson('/api/v1/entries/faq')->assertStatus(403);
    $this->getJson('/api/v1/seo/pages')->assertOk();
    $this->postJson('/api/v1/seo/redirects', ['from_path' => '/a', 'to_path' => '/b', 'code' => 301])->assertStatus(403);
    $this->getJson('/api/v1/leads')->assertStatus(403);
    $this->postJson('/api/v1/publish')->assertStatus(403);
    $this->getJson('/api/v1/users')->assertStatus(403);
});

it('separates view from edit inside a module', function () {
    roleUser(['M03' => 'view']);
    $this->postJson('/api/v1/public/leads', ['name' => 'A', 'property' => 'B', 'phone' => '01711111111']);
    $id = \App\Models\Lead::first()->id;
    $this->getJson('/api/v1/leads')->assertOk();
    $this->patchJson("/api/v1/leads/$id", ['status' => 'won'])->assertStatus(403);
    $this->get('/api/v1/leads/export')->assertStatus(403);
});

it('can let a non-owner publish when the role has Publish edit', function () {
    seedContent();
    roleUser(['M20' => 'edit']);
    $this->postJson('/api/v1/publish')->assertCreated();
});

it('changes take effect at once for users of the role', function () {
    actAs('owner');
    $role = Role::create(['key' => 'temp', 'name' => ['bn' => 'ট', 'en' => 'Temp'], 'permissions' => ['M04' => 'view']]);
    $u = User::factory()->create(['role' => 'temp']);
    $this->patchJson("/api/v1/roles/{$role->id}", ['name' => ['bn' => 'ট', 'en' => 'Temp'], 'permissions' => ['M03' => 'view']])->assertOk();
    Sanctum::actingAs($u);
    \App\Content\Permissions::flush();
    $this->getJson('/api/v1/leads')->assertOk();
    $this->getJson('/api/v1/analytics/overview')->assertStatus(403);
});

it('protects the owner role and roles in use', function () {
    actAs('owner');
    $owner = Role::where('key', 'owner')->first();
    $this->patchJson("/api/v1/roles/{$owner->id}", ['name' => ['bn' => 'ও', 'en' => 'O'], 'permissions' => []])->assertStatus(409);
    $this->deleteJson("/api/v1/roles/{$owner->id}")->assertStatus(409);
    $sales = Role::where('key', 'sales')->first();
    User::factory()->create(['role' => 'sales']);
    $this->deleteJson("/api/v1/roles/{$sales->id}")->assertStatus(409)->assertJsonPath('code', 'role_in_use');
});

it('only accepts existing roles for users', function () {
    actAs('owner');
    $this->postJson('/api/v1/users', ['name' => 'X', 'email' => 'x@b.co', 'role' => 'ghost'])->assertStatus(422);
    $this->postJson('/api/v1/users', ['name' => 'X', 'email' => 'x@b.co', 'role' => 'sales'])->assertCreated();
});
