<?php

use App\Models\User;

it('logs in with the right password and returns a token', function () {
    User::factory()->create(['email' => 'a@b.co', 'password' => 'correct-horse', 'role' => 'editor']);
    $r = $this->postJson('/api/v1/auth/login', ['email' => 'a@b.co', 'password' => 'correct-horse'])->assertOk();
    expect($r->json('token'))->toBeString()->and($r->json('user.role'))->toBe('editor');
    $this->withToken($r->json('token'))->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('user.email', 'a@b.co');
});

it('refuses a wrong password with the shared error shape', function () {
    User::factory()->create(['email' => 'a@b.co', 'password' => 'correct-horse']);
    $this->postJson('/api/v1/auth/login', ['email' => 'a@b.co', 'password' => 'nope'])
        ->assertStatus(422)->assertJsonStructure(['code', 'message', 'fields'])->assertJsonPath('code', 'invalid_login');
});

it('blocks a disabled user', function () {
    User::factory()->create(['email' => 'a@b.co', 'password' => 'correct-horse', 'active' => false]);
    $this->postJson('/api/v1/auth/login', ['email' => 'a@b.co', 'password' => 'correct-horse'])->assertStatus(422);
});

it('locks out after five wrong tries', function () {
    User::factory()->create(['email' => 'a@b.co', 'password' => 'correct-horse']);
    foreach (range(1, 5) as $_) $this->postJson('/api/v1/auth/login', ['email' => 'a@b.co', 'password' => 'x']);
    $this->postJson('/api/v1/auth/login', ['email' => 'a@b.co', 'password' => 'correct-horse'])->assertStatus(429);
});

it('needs a token for admin routes', function () {
    $this->getJson('/api/v1/dashboard')->assertStatus(401)->assertJsonPath('code', 'unauthenticated');
});

it('keeps each role to its own area', function () {
    actAs('sales');
    $this->getJson('/api/v1/leads')->assertOk();
    expect($this->getJson('/api/v1/types')->assertOk()->json('types'))->toBe([]); // sales sees no content types
    $this->getJson('/api/v1/entries/faq')->assertStatus(403)->assertJsonPath('code', 'forbidden');
    actAs('editor');
    $this->getJson('/api/v1/types')->assertOk();
    $this->getJson('/api/v1/leads')->assertStatus(403);
    $this->postJson('/api/v1/publish')->assertStatus(403);
    $this->getJson('/api/v1/users')->assertStatus(403);
});

it('changes the password only with the current one', function () {
    $u = actAs('editor');
    $u->forceFill(['password' => 'old-password-1'])->save();
    $this->postJson('/api/v1/auth/password', ['current' => 'wrong', 'password' => 'new-password-12'])->assertStatus(422)->assertJsonPath('fields.current', 'Current password is wrong.');
    $this->postJson('/api/v1/auth/password', ['current' => 'old-password-1', 'password' => 'new-password-12'])->assertOk();
});
