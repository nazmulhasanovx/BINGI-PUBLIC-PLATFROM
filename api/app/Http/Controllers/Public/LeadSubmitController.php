<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Support\ApiError;
use App\Support\Visitor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/** POST /api/v1/public/leads — the site's "Book a demo" form. Rate limited (routes/api.php). */
class LeadSubmitController extends Controller
{
    public function __invoke(Request $r)
    {
        if ($r->filled('website')) return response(['ok' => true], 201); // honeypot: bots fill hidden fields; pretend success
        $d = $r->validate([
            'name' => 'required|string|max:120',
            'property' => 'required|string|max:160',
            'phone' => ['required', 'string', 'max:32', 'regex:/^\+?\d[\d\s-]{8,}$/'],
            'property_type' => 'nullable|string|max:24',
            'rooms' => 'nullable|integer|min:1|max:100000',
            'preferred_time' => 'nullable|string|max:120',
            'source_page' => 'nullable|string|max:255',
            'utm' => 'nullable|array',
            'lang' => 'nullable|in:bn,en',
        ], ['phone.regex' => 'Write a phone number, e.g. 01XXXXXXXXX.']);
        $recent = Lead::where('phone', $d['phone'])->where('created_at', '>', now()->subMinutes(10))->exists();
        if ($recent) throw new ApiError('duplicate', 'We already have this request — our team will call you.', 409);
        $lead = Lead::create($d + ['lang' => 'bn']);
        Visitor::record($r, 'lead', $d['source_page'] ?? '/contact');
        if ($url = config('content.lead_webhook_url')) {
            try { Http::timeout(5)->post($url, ['lead' => $lead->toArray()]); } catch (\Throwable $e) { Log::warning('lead webhook', ['e' => $e->getMessage()]); }
        }
        return response(['ok' => true, 'id' => $lead->id], 201);
    }
}
