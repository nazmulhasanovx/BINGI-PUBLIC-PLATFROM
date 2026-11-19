<?php

use App\Models\DailyStat;
use App\Models\VisitEvent;
use Illuminate\Support\Facades\Artisan;

$ev = fn ($type, $path = '/', $ref = null) => ['type' => $type, 'path' => $path, 'referrer' => $ref];

it('records events without storing the IP', function () use ($ev) {
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 (iPhone)', 'CF-IPCountry' => 'BD'])
        ->postJson('/api/v1/public/events', ['events' => [$ev('pageview', '/pricing?x=1', 'https://www.google.com/search')]])->assertNoContent();
    $e = VisitEvent::first();
    expect($e->path)->toBe('/pricing')->and($e->referrer_host)->toBe('google.com')->and($e->device)->toBe('mobile')->and($e->country)->toBe('BD');
    expect(strlen($e->visitor_hash))->toBe(16);
    expect(json_encode($e->toArray()))->not->toContain('127.0.0.1');
});

it('ignores bots and refuses unknown event types', function () use ($ev) {
    $this->withHeaders(['User-Agent' => 'Googlebot/2.1'])->postJson('/api/v1/public/events', ['events' => [$ev('pageview')]])->assertNoContent();
    expect(VisitEvent::count())->toBe(0);
    $this->postJson('/api/v1/public/events', ['events' => [$ev('buy_now')]])->assertStatus(422);
});

it('does not let the site fake leads through events', function () use ($ev) {
    $this->postJson('/api/v1/public/events', ['events' => [$ev('lead', '/x')]])->assertNoContent();
    expect(VisitEvent::count())->toBe(0);
});

it('reports only what was recorded', function () use ($ev) {
    actAs('sales');
    $empty = $this->getJson('/api/v1/analytics/overview')->assertOk();
    expect($empty->json('has_data'))->toBeFalse()->and($empty->json('totals.conversion'))->toBeNull();

    $ua1 = ['User-Agent' => 'Mozilla/5.0 A']; $ua2 = ['User-Agent' => 'Mozilla/5.0 B'];
    $this->withHeaders($ua1)->postJson('/api/v1/public/events', ['events' => [$ev('pageview', '/'), $ev('pageview', '/pricing'), $ev('demo_open', '/pricing')]]);
    $this->withHeaders($ua2)->postJson('/api/v1/public/events', ['events' => [$ev('pageview', '/', 'https://facebook.com/x')]]);
    $this->postJson('/api/v1/public/leads', ['name' => 'A', 'property' => 'B', 'phone' => '01711111111', 'source_page' => '/pricing']);
    $r = $this->getJson('/api/v1/analytics/overview')->assertOk();
    expect($r->json('has_data'))->toBeTrue()
        ->and($r->json('totals.views'))->toBe(3)
        ->and($r->json('totals.visitors'))->toBe(2)
        ->and($r->json('totals.leads'))->toBe(1)
        ->and($r->json('totals.demo_opens'))->toBe(1)
        ->and($r->json('totals.conversion'))->toEqual(50);
    expect(collect($r->json('sources'))->pluck('key'))->toContain('facebook.com', 'direct');
    expect($r->json('pages.0.key'))->toBe('/');
});

it('rolls events into daily totals and prunes old raw events', function () use ($ev) {
    $this->postJson('/api/v1/public/events', ['events' => [$ev('pageview', '/')]]);
    Artisan::call('analytics:rollup', ['date' => now('Asia/Dhaka')->toDateString()]);
    expect(DailyStat::first()->views)->toBe(1);
    VisitEvent::query()->update(['at' => now()->subDays(120)]);
    Artisan::call('analytics:prune');
    expect(VisitEvent::count())->toBe(0);
});

it('accepts the text/plain body navigator.sendBeacon sends', function () {
    $this->call('POST', '/api/v1/public/events', [], [], [], ['CONTENT_TYPE' => 'text/plain', 'HTTP_USER_AGENT' => 'Mozilla/5.0'], json_encode(['events' => [['type' => 'pageview', 'path' => '/beacon']]]))->assertNoContent();
    expect(VisitEvent::where('path', '/beacon')->count())->toBe(1);
});
