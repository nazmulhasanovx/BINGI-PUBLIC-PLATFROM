<?php

use App\Models\Media;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

it('edits page SEO with honest length checks and publishes it', function () {
    seedContent();
    actAs('editor');
    $r = $this->postJson('/api/v1/seo/pages', ['path' => '/new-page', 'title' => 'Short', 'description' => 'Tiny'])->assertOk();
    expect(collect($r->json('item.checks'))->pluck('msg')->implode(' '))->toContain('Title is short')->toContain('Description is short');
    $this->postJson('/api/v1/seo/pages', ['path' => 'no-slash', 'title' => 'x', 'description' => 'y'])->assertStatus(422);
    $this->postJson('/api/v1/seo/redirects', ['from_path' => '/old', 'to_path' => '/pricing', 'code' => 301])->assertOk();
    $this->postJson('/api/v1/seo/redirects', ['from_path' => '/same', 'to_path' => '/same', 'code' => 301])->assertStatus(422);
    $pending = collect($this->getJson('/api/v1/publish/pending')->json('items'));
    expect($pending->where('type', 'seo')->pluck('title'))->toContain('/new-page')->and($pending->where('type', 'redirects'))->toHaveCount(1);
    actAs('owner');
    $this->postJson('/api/v1/publish')->assertCreated();
    expect($this->getJson('/api/v1/publish/pending')->json('items'))->toBeEmpty();
    $c = $this->getJson('/api/v1/public/content')->json();
    expect($c['seo']['/new-page']['title'])->toBe('Short')->and($c['redirects'][0])->toBe(['from' => '/old', 'to' => '/pricing', 'code' => 301]);
});

it('turns an uploaded photo into WebP sizes', function () {
    actAs('editor');
    $r = $this->postJson('/api/v1/media', ['file' => UploadedFile::fake()->image('team photo.jpg', 2000, 1500)])->assertCreated();
    expect($r->json('mime'))->toBe('image/webp')->and(array_keys($r->json('variants')))->toBe([480, 960, 1600]);
    expect($r->json('path'))->toEndWith('-1600.webp');
    $this->deleteJson('/api/v1/media/' . $r->json('id'))->assertOk();
    expect(Media::count())->toBe(0);
});

it('never upscales a small image', function () {
    actAs('editor');
    $r = $this->postJson('/api/v1/media', ['file' => UploadedFile::fake()->image('small.png', 600, 400)])->assertCreated();
    expect(array_keys($r->json('variants')))->toBe([480, 600]);
});

it('keeps permission files (PDF) as they are', function () {
    actAs('editor');
    $r = $this->postJson('/api/v1/media', ['file' => UploadedFile::fake()->create('permission.pdf', 100, 'application/pdf')])->assertCreated();
    expect($r->json('path'))->toEndWith('.pdf');
});

it('invites users and always keeps one owner', function () {
    $owner = actAs('owner');
    $this->postJson('/api/v1/users', ['name' => 'Sara', 'email' => 'Sara@Bingi.app', 'role' => 'sales'])->assertCreated()->assertJsonPath('item.email', 'sara@bingi.app');
    $this->patchJson("/api/v1/users/{$owner->id}", ['role' => 'editor'])->assertStatus(409)->assertJsonPath('code', 'last_owner');
    $this->getJson('/api/v1/audit')->assertOk()->assertJsonPath('data.0.action', 'invited');
});

it('signs a disabled user out everywhere', function () {
    actAs('owner');
    $u = User::factory()->create(['role' => 'editor']);
    $u->createToken('x');
    $this->patchJson("/api/v1/users/{$u->id}", ['active' => false])->assertOk();
    expect($u->tokens()->count())->toBe(0);
});

it('shows a dashboard', function () {
    seedContent();
    actAs('sales');
    $this->getJson('/api/v1/dashboard')->assertOk()->assertJsonPath('live.version', 1)->assertJsonPath('unpublished', 0);
});

it('refuses SVG uploads (they can carry scripts)', function () {
    actAs('editor');
    $svg = UploadedFile::fake()->createWithContent('x.svg', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');
    $this->postJson('/api/v1/media', ['file' => $svg])->assertStatus(422);
});
