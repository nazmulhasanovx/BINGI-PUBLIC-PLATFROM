<?php

use App\Models\Entry;
use App\Models\Snapshot;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

it('seeds today\'s site content and publishes it as version 1', function () {
    seedContent();
    expect(Snapshot::count())->toBe(1)->and(Entry::count())->toBeGreaterThan(150);
    $c = $this->getJson('/api/v1/public/content')->assertOk()->assertHeader('X-Content-Version', '1')->json();
    // the keys the website's data files read with pick()
    foreach (['site', 'nav', 'footer', 'modules', 'platformStatus', 'integrations', 'plans', 'cycles', 'cycleRates', 'minBillable', 'themes', 'storeThemes', 'team', 'posts', 'docs', 'faqs', 'changes', 'roles', 'solutions', 'trustFacts', 'seo', 'meta'] as $k) {
        expect($c)->toHaveKey($k);
    }
    expect($c['meta']['version'])->toBe(1);
    Storage::disk('public')->assertExists('content/latest.json');
});

it('never publishes internal fields', function () {
    seedContent();
    $c = $this->getJson('/api/v1/public/content')->json();
    expect($c['modules'][0])->not->toHaveKeys(['verified_by', 'verified_at']);
});

it('shows pending changes, then publishes them', function () {
    seedContent();
    actAs('owner');
    $e = Entry::where('type', 'team_member')->first();
    $this->patchJson("/api/v1/entries/team_member/{$e->id}", ['data' => array_replace($e->data, ['name' => 'Changed Name'])])->assertOk()->assertJsonPath('item.state', 'changed');
    $p = $this->getJson('/api/v1/publish/pending')->assertOk()->json('items');
    expect($p)->toHaveCount(1)->and($p[0]['change'])->toBe('edited');
    // live content does not change until publish
    expect($this->getJson('/api/v1/public/content')->json('team.0.name'))->not->toBe('Changed Name');
    $this->postJson('/api/v1/publish', ['note' => 'name fix'])->assertCreated()->assertJsonPath('item.version', 2);
    expect($this->getJson('/api/v1/public/content')->json('team.0.name'))->toBe('Changed Name');
    expect($this->getJson('/api/v1/publish/pending')->json('items'))->toBeEmpty();
});

it('removes deleted and hidden items at publish', function () {
    seedContent();
    actAs('owner');
    $n = count($this->getJson('/api/v1/public/content')->json('faqs'));
    $faq = Entry::where('type', 'faq')->first();
    $this->deleteJson("/api/v1/entries/faq/{$faq->id}")->assertOk();
    $other = Entry::where('type', 'faq')->first();
    $this->patchJson("/api/v1/entries/faq/{$other->id}", ['visible' => false])->assertOk();
    expect($this->getJson('/api/v1/publish/pending')->json('items'))->toHaveCount(2);
    $this->postJson('/api/v1/publish')->assertCreated();
    expect($this->getJson('/api/v1/public/content')->json('faqs'))->toHaveCount($n - 2);
    expect(Entry::withTrashed()->find($faq->id))->toBeNull();
});

it('preview shows the draft without publishing', function () {
    seedContent();
    actAs('editor');
    $e = Entry::where('type', 'team_member')->first();
    $this->patchJson("/api/v1/entries/team_member/{$e->id}", ['data' => array_replace($e->data, ['name' => 'Draft Name'])]);
    expect($this->getJson('/api/v1/publish/preview')->json('team.0.name'))->toBe('Draft Name');
    expect(Snapshot::count())->toBe(1);
});

it('rolls back to an older version as a new version', function () {
    seedContent();
    actAs('owner');
    $e = Entry::where('type', 'team_member')->first();
    $old = $e->data['name'];
    $this->patchJson("/api/v1/entries/team_member/{$e->id}", ['data' => array_replace($e->data, ['name' => 'Oops'])]);
    $this->postJson('/api/v1/publish')->assertCreated();
    $v1 = Snapshot::where('version', 1)->first();
    $this->postJson("/api/v1/snapshots/{$v1->id}/rollback")->assertCreated()->assertJsonPath('item.version', 3)->assertJsonPath('item.rolled_back_from', 1);
    expect($this->getJson('/api/v1/public/content')->json('team.0.name'))->toBe($old);
});

it('triggers the site build when a hook is set', function () {
    config(['content.build_hook_url' => 'https://api.github.com/repos/x/y/dispatches', 'content.build_hook_token' => 't']);
    Http::fake(['api.github.com/*' => Http::response(null, 204)]);
    seedContent();
    expect(Snapshot::first()->build_status)->toBe('triggered');
    Http::assertSent(fn ($r) => $r['event_type'] === 'content-published');
});

it('maps page copy and hidden sections into their shapes', function () {
    seedContent();
    actAs('owner');
    $this->postJson('/api/v1/entries/page_copy', ['data' => ['key' => 'home.hero.cta', 'value' => ['bn' => 'ফ্রি শুরু', 'en' => 'Start free']]])->assertCreated();
    $this->postJson('/api/v1/entries/hidden_section', ['data' => ['key' => 'home.team']])->assertCreated();
    $this->postJson('/api/v1/publish')->assertCreated();
    $c = $this->getJson('/api/v1/public/content')->json();
    expect($c['copy']['home.hero.cta']['en'])->toBe('Start free')->and($c['hiddenSections'])->toBe(['home.team']);
});

it('says so when nothing is published yet', function () {
    $this->getJson('/api/v1/public/content')->assertStatus(404)->assertJsonPath('code', 'not_published');
});
