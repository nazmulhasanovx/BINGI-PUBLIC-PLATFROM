<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DailyStat;
use App\Models\VisitEvent;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Visitor numbers come ONLY from recorded events (last 90 days) and daily_stats (older days).
 * "Visitors" = unique visitors per day, added up over the range (the hash changes daily by design).
 */
class AnalyticsController extends Controller
{
    public function overview(Request $r)
    {
        [$from, $to] = self::range($r);
        $ev = VisitEvent::query()->whereBetween('at', [$from, $to]);
        $tz = 'Asia/Dhaka';
        $events = (clone $ev)->get(['at', 'type', 'path', 'referrer_host', 'utm', 'country', 'device', 'visitor_hash']);
        $byDay = [];
        foreach (CarbonPeriod::create($from->copy()->timezone($tz)->startOfDay(), $to->copy()->timezone($tz)->startOfDay()) as $d) {
            $byDay[$d->toDateString()] = ['date' => $d->toDateString(), 'visitors' => 0, 'views' => 0, 'leads' => 0, 'demo_opens' => 0, 'whatsapp' => 0];
        }
        $uniq = [];
        foreach ($events as $e) {
            $day = $e->at->copy()->timezone($tz)->toDateString();
            if (!isset($byDay[$day])) continue;
            $k = match ($e->type) { 'pageview' => 'views', 'lead' => 'leads', 'demo_open' => 'demo_opens', 'whatsapp' => 'whatsapp', default => null };
            if ($k) $byDay[$day][$k]++;
            if ($e->type === 'pageview') $uniq[$day][$e->visitor_hash] = true;
        }
        foreach ($uniq as $day => $set) $byDay[$day]['visitors'] = count($set);
        // days older than the raw events: use the rollup
        $oldest = VisitEvent::min('at');
        $rolled = DailyStat::query()->whereBetween('date', [$from->toDateString(), $to->toDateString()])
            ->when($oldest, fn ($q) => $q->where('date', '<', Carbon::parse($oldest)->timezone($tz)->toDateString()))
            ->selectRaw('date, sum(visitors) visitors, sum(views) views, sum(leads) leads, sum(demo_opens) demo_opens, sum(whatsapp) whatsapp')
            ->groupBy('date')->get();
        foreach ($rolled as $d) $byDay[(string) $d->date] = ['date' => (string) $d->date] + array_map('intval', $d->only(['visitors', 'views', 'leads', 'demo_opens', 'whatsapp']));
        ksort($byDay);
        $series = array_values($byDay);
        $sum = fn ($k) => array_sum(array_column($series, $k));
        $views = $events->where('type', 'pageview');
        $top = fn ($col, $n = 8) => $views->groupBy($col)->map(fn ($g, $k) => ['key' => $k ?: null, 'views' => $g->count(), 'visitors' => $g->pluck('visitor_hash')->unique()->count()])
            ->sortByDesc('views')->take($n)->values();
        $sources = $views->groupBy(fn ($e) => $e->utm['source'] ?? $e->referrer_host ?? 'direct')
            ->map(fn ($g, $k) => ['key' => $k, 'visitors' => $g->pluck('visitor_hash')->unique()->count()])->sortByDesc('visitors')->take(8)->values();
        $leadPages = $events->where('type', 'lead')->countBy('path')->sortDesc()->take(5)->map(fn ($n, $p) => ['key' => $p, 'leads' => $n])->values();
        $totals = ['visitors' => $sum('visitors'), 'views' => $sum('views'), 'leads' => $sum('leads'), 'demo_opens' => $sum('demo_opens'), 'whatsapp' => $sum('whatsapp')];
        $totals['conversion'] = $totals['visitors'] ? round($totals['leads'] / $totals['visitors'] * 100, 2) : null;
        return [
            'from' => $from->toDateString(), 'to' => $to->toDateString(),
            'has_data' => $totals['views'] > 0 || $totals['leads'] > 0,
            'totals' => $totals, 'series' => $series,
            'pages' => $top('path'), 'sources' => $sources, 'countries' => $top('country', 6), 'devices' => $top('device', 3),
            'lead_pages' => $leadPages,
        ];
    }

    public function page(Request $r)
    {
        $path = (string) $r->query('path', '/');
        [$from, $to] = self::range($r);
        $ev = VisitEvent::query()->whereBetween('at', [$from, $to])->where('path', $path)->get();
        $views = $ev->where('type', 'pageview');
        return [
            'path' => $path,
            'views' => $views->count(), 'visitors' => $views->pluck('visitor_hash')->unique()->count(),
            'leads' => $ev->where('type', 'lead')->count(), 'demo_opens' => $ev->where('type', 'demo_open')->count(),
            'sources' => $views->groupBy(fn ($e) => $e->referrer_host ?? 'direct')->map->count()->sortDesc()->take(8),
        ];
    }

    private static function range(Request $r): array
    {
        $tz = 'Asia/Dhaka';
        $to = $r->query('to') ? Carbon::parse($r->query('to'), $tz)->endOfDay() : now($tz)->endOfDay();
        $from = $r->query('from') ? Carbon::parse($r->query('from'), $tz)->startOfDay() : $to->copy()->subDays(29)->startOfDay();
        if ($from->diffInDays($to) > 366) $from = $to->copy()->subDays(366)->startOfDay();
        return [$from->utc(), $to->utc()];
    }
}
