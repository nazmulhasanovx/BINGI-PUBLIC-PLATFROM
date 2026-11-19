<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\VisitEvent;
use App\Support\Visitor;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** POST /api/v1/public/events — { events: [{ type, path, referrer?, utm?, lang? }] }, max 20 per call. */
class EventController extends Controller
{
    public function __invoke(Request $r)
    {
        // navigator.sendBeacon sends text/plain (no CORS preflight), so read the raw body too.
        $input = $r->isJson() ? $r->all() : (json_decode($r->getContent(), true) ?: []);
        $d = validator($input, [
            'events' => 'required|array|max:20',
            'events.*.type' => ['required', Rule::in(VisitEvent::TYPES)],
            'events.*.path' => 'required|string|max:255',
            'events.*.referrer' => 'nullable|string|max:500',
            'events.*.utm' => 'nullable|array',
            'events.*.lang' => 'nullable|in:bn,en',
        ])->validate();
        if (Visitor::isBot($r)) return response()->noContent();
        foreach ($d['events'] as $e) {
            if ($e['type'] === 'lead') continue; // leads are counted server-side when the lead is saved
            Visitor::record($r, $e['type'], $e['path'], $e['referrer'] ?? null, $e['utm'] ?? null, $e['lang'] ?? null);
        }
        return response()->noContent();
    }
}
