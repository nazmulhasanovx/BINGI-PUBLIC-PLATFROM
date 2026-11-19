<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entry;
use App\Models\Lead;
use App\Models\Snapshot;
use App\Models\VisitEvent;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $today = now('Asia/Dhaka')->startOfDay()->utc();
        $live = Snapshot::with('publisher:id,name')->orderByDesc('version')->first();
        return [
            'visitors_today' => VisitEvent::where('type', 'pageview')->where('at', '>=', $today)->distinct('visitor_hash')->count('visitor_hash'),
            'views_today' => VisitEvent::where('type', 'pageview')->where('at', '>=', $today)->count(),
            'leads_new' => Lead::where('status', 'new')->count(),
            'leads_7d' => Lead::where('created_at', '>=', now()->subDays(7))->count(),
            'unpublished' => Entry::withTrashed()->get()->filter(fn ($e) => $e->trashed() || $e->state() !== 'published')->count(),
            'live' => $live ? ['version' => $live->version, 'published_at' => $live->published_at->toIso8601String(), 'by' => $live->publisher?->name, 'build_status' => $live->build_status] : null,
            'recent_leads' => Lead::latest()->limit(5)->get(['id', 'name', 'property', 'status', 'created_at']),
        ];
    }
}
