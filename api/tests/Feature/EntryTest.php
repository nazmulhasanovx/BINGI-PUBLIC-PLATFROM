<?php

use App\Models\AuditLog;
use App\Models\Entry;

it('lists types with counts', function () {
    actAs('editor');
    $r = $this->getJson('/api/v1/types')->assertOk();
    expect(collect($r->json('types'))->pluck('type'))->toContain('team_member', 'faq', 'blog_post')->not->toContain('module', 'plan', 'site'); // status, pricing, settings: owner by default
});

it('creates, edits, reorders and deletes an entry, all audited', function () {
    actAs('editor');
    $a = $this->postJson('/api/v1/entries/team_member', ['data' => teamItem()])->assertCreated()->json('item');
    expect($a['state'])->toBe('draft');
    $b = $this->postJson('/api/v1/entries/team_member', ['data' => teamItem(['name' => 'Second'])])->assertCreated()->json('item');
    $this->patchJson("/api/v1/entries/team_member/{$a['id']}", ['data' => teamItem(['name' => 'Renamed'])])->assertOk()->assertJsonPath('item.data.name', 'Renamed');
    $this->postJson('/api/v1/entries/team_member/reorder', ['ids' => [$b['id'], $a['id']]])->assertOk();
    expect($this->getJson('/api/v1/entries/team_member')->json('items.0.data.name'))->toBe('Second');
    $this->deleteJson("/api/v1/entries/team_member/{$a['id']}")->assertOk();
    expect(Entry::where('type', 'team_member')->count())->toBe(1);
    expect(AuditLog::pluck('action')->all())->toContain('created', 'updated', 'reordered', 'deleted');
});

it('says exactly which field is wrong', function () {
    actAs('editor');
    $this->postJson('/api/v1/entries/team_member', ['data' => ['name' => 'X', 'role' => ['bn' => '', 'en' => 'Dev'], 'linkedin' => 'not a url']])
        ->assertStatus(422)
        ->assertJsonPath('fields.role', 'Write both Bangla and English.')
        ->assertJsonPath('fields.group', 'Required.')
        ->assertJsonPath('fields.linkedin', 'Must be a link starting with https:// or /.');
});

it('rejects an unknown type', function () {
    actAs('editor');
    $this->getJson('/api/v1/entries/nope')->assertStatus(404)->assertJsonPath('code', 'unknown_type');
});

it('drops fields that are not in the type', function () {
    actAs('editor');
    $r = $this->postJson('/api/v1/entries/team_member', ['data' => teamItem(['hack' => '<script>'])])->assertCreated();
    expect($r->json('item.data'))->not->toHaveKey('hack');
});

describe('truth guards', function () {
    $module = fn ($over = []) => array_replace(['id' => 'ota', 'status' => 'live', 'icon' => 'Network', 'name' => ['bn' => 'ও', 'en' => 'OTA'], 'desc' => ['bn' => 'ও', 'en' => 'OTA']], $over);

    it('will not mark a module Live without who verified it and when', function () use ($module) {
        actAs('owner');
        $this->postJson('/api/v1/entries/module', ['data' => $module()])->assertStatus(422)->assertJsonPath('fields.verified_by', 'Live needs who verified it and when.');
        $this->postJson('/api/v1/entries/module', ['data' => $module(['verified_by' => 'Nazmul', 'verified_at' => '2026-11-19'])])->assertCreated();
    });

    it('never lets BinGi AI be Live', function () use ($module) {
        actAs('owner');
        $this->postJson('/api/v1/entries/module', ['data' => $module(['id' => 'ai', 'verified_by' => 'x', 'verified_at' => '2026-11-19'])])
            ->assertStatus(422)->assertJsonPath('fields.status', 'BinGi AI can only be Beta or Coming Soon.');
    });

    it('needs written permission to show a testimonial', function () {
        actAs('editor');
        $t = ['quote' => ['bn' => 'ভালো', 'en' => 'Good'], 'name' => 'A', 'role' => ['bn' => 'ম', 'en' => 'M'], 'property' => 'P'];
        $this->postJson('/api/v1/entries/testimonial', ['data' => $t])->assertStatus(422)->assertJsonPath('fields.permission_file', 'Upload the written permission before showing this.');
        $this->postJson('/api/v1/entries/testimonial', ['data' => $t, 'visible' => false])->assertCreated(); // can be saved hidden
        $this->postJson('/api/v1/entries/testimonial', ['data' => $t + ['permission_file' => '/storage/media/p.pdf']])->assertCreated();
    });

    it('needs a source for every trust fact', function () {
        actAs('editor');
        $this->postJson('/api/v1/entries/trust_fact', ['data' => ['value' => ['bn' => '50', 'en' => '50'], 'label' => ['bn' => 'হোটেল', 'en' => 'hotels']]])
            ->assertStatus(422)->assertJsonPath('fields.source', 'Say where this fact comes from.');
    });
});

it('keeps single types to one item', function () {
    actAs('owner');
    $site = json_decode(file_get_contents(config('content.seed_dir') . '/site.json'), true)[0];
    $this->postJson('/api/v1/entries/site', ['data' => $site])->assertCreated();
    $this->postJson('/api/v1/entries/site', ['data' => $site])->assertStatus(409)->assertJsonPath('code', 'single_exists');
});

it('keeps site settings, menus, status and pricing to owners', function () {
    actAs('editor');
    $plan = json_decode(file_get_contents(config('content.seed_dir') . '/plan.json'), true)[0];
    $this->postJson('/api/v1/entries/plan', ['data' => $plan])->assertStatus(403)->assertJsonPath('message', 'Your role cannot change this.');
    $this->postJson('/api/v1/entries/faq', ['data' => ['page' => 'home', 'q' => ['bn' => 'প্র', 'en' => 'Q'], 'a' => ['bn' => 'উ', 'en' => 'A']]])->assertCreated();
});

describe('customer stories', function () {
    $story = fn ($over = []) => array_replace([
        'slug' => 'real-hotel', 'property' => 'Real Hotel', 'location' => ['bn' => 'ঢাকা', 'en' => 'Dhaka'], 'propertyType' => 'hotel',
        'headline' => ['bn' => 'হ', 'en' => 'H'], 'summary' => ['bn' => 'স', 'en' => 'S'], 'challenge' => ['bn' => 'চ', 'en' => 'C'], 'solution' => ['bn' => 'স', 'en' => 'S'],
        'results' => [['value' => '30%', 'label' => ['bn' => 'ল', 'en' => 'L'], 'source' => 'Hotel report, Mar 2027']],
        'permission_file' => '/storage/media/permission.pdf',
    ], $over);

    it('publishes a real story with permission and sourced numbers', function () use ($story) {
        actAs('owner');
        $this->postJson('/api/v1/entries/customer_story', ['data' => $story()])->assertCreated();
        $this->postJson('/api/v1/publish')->assertCreated();
        $c = $this->getJson('/api/v1/public/content')->json('stories');
        expect($c)->toHaveCount(1)->and($c[0])->not->toHaveKeys(['permission_file', 'sample']);
    });

    it('never shows a sample story', function () use ($story) {
        actAs('editor');
        $this->postJson('/api/v1/entries/customer_story', ['data' => $story(['sample' => true])])->assertStatus(422)->assertJsonPath('fields.sample', 'A sample story can never be shown. Replace it with a real story and switch "sample" off.');
        $this->postJson('/api/v1/entries/customer_story', ['data' => $story(['sample' => true]), 'visible' => false])->assertCreated();
    });

    it('needs a source for every result number', function () use ($story) {
        actAs('editor');
        $this->postJson('/api/v1/entries/customer_story', ['data' => $story(['results' => [['value' => '50%', 'label' => ['bn' => 'ল', 'en' => 'L']]]])])
            ->assertStatus(422)->assertJsonPath('fields', fn ($f) => isset($f['results.0.source']));
    });

    it('seeds the five samples hidden, so nothing shows on the site', function () {
        seedContent();
        expect(\App\Models\Entry::where('type', 'customer_story')->where('visible', false)->count())->toBe(5);
        expect($this->getJson('/api/v1/public/content')->json('stories'))->toBe([]);
    });
});
