<?php

use App\Models\AuditLog;
use App\Models\Lead;
use App\Models\VisitEvent;

$lead = ['name' => 'Rahim', 'property' => 'Sea View Inn', 'phone' => '01711111111', 'source_page' => '/pricing'];

it('saves a demo request from the site and counts it', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', $lead)->assertCreated();
    expect(Lead::first()->status)->toBe('new');
    expect(VisitEvent::where('type', 'lead')->where('path', '/pricing')->count())->toBe(1);
});

it('ignores bots that fill the hidden field', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', $lead + ['website' => 'http://spam'])->assertCreated();
    expect(Lead::count())->toBe(0);
});

it('checks the phone number', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', ['phone' => 'abc'] + $lead)->assertStatus(422)->assertJsonPath('fields.phone', 'Write a phone number, e.g. 01XXXXXXXXX.');
});

it('does not save the same phone twice in ten minutes', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', $lead)->assertCreated();
    $this->postJson('/api/v1/public/leads', $lead)->assertStatus(409)->assertJsonPath('code', 'duplicate');
});

it('limits how fast one visitor can send', function () use ($lead) {
    foreach (range(1, 3) as $i) $this->postJson('/api/v1/public/leads', ['phone' => "0171111111$i"] + $lead);
    $this->postJson('/api/v1/public/leads', ['phone' => '01799999999'] + $lead)->assertStatus(429);
});

it('lets sales work a lead: status, note, export (audited)', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', $lead);
    $u = actAs('sales');
    $l = Lead::first();
    $this->getJson('/api/v1/leads')->assertOk()->assertJsonPath('data.0.name', 'Rahim')->assertJsonPath('counts.new', 1);
    $this->patchJson("/api/v1/leads/{$l->id}", ['status' => 'contacted', 'assigned_to' => $u->id])->assertOk()->assertJsonPath('item.status', 'contacted');
    $this->patchJson("/api/v1/leads/{$l->id}", ['status' => 'maybe'])->assertStatus(422);
    $this->postJson("/api/v1/leads/{$l->id}/notes", ['body' => 'Called, wants demo Sunday'])->assertCreated();
    $this->getJson("/api/v1/leads/{$l->id}")->assertJsonPath('item.notes.0.body', 'Called, wants demo Sunday');
    $csv = $this->get('/api/v1/leads/export')->assertOk()->getContent();
    expect($csv)->toContain('Sea View Inn');
    expect(AuditLog::where('action', 'exported')->count())->toBeGreaterThan(0);
});

it('searches leads by name, property or phone', function () use ($lead) {
    $this->postJson('/api/v1/public/leads', $lead);
    $this->postJson('/api/v1/public/leads', ['name' => 'Karim', 'property' => 'Hill Lodge', 'phone' => '01822222222']);
    actAs('owner');
    expect($this->getJson('/api/v1/leads?q=Hill')->json('data'))->toHaveCount(1);
    expect($this->getJson('/api/v1/leads?q=0171')->json('data.0.name'))->toBe('Rahim');
});
