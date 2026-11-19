<?php

use App\Models\DailyStat;
use App\Models\VisitEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

// Fold raw events into daily_stats (safe to run again: it rewrites the day).
Artisan::command('analytics:rollup {date?}', function (?string $date = null) {
    $tz = 'Asia/Dhaka';
    $day = $date ? Carbon::parse($date, $tz) : now($tz)->subDay();
    $from = $day->copy()->startOfDay()->utc(); $to = $day->copy()->endOfDay()->utc();
    $rows = VisitEvent::whereBetween('at', [$from, $to])->get()->groupBy('path');
    DailyStat::where('date', $day->toDateString())->delete();
    foreach ($rows as $path => $g) {
        DailyStat::create(['date' => $day->toDateString(), 'path' => $path,
            'visitors' => $g->where('type', 'pageview')->pluck('visitor_hash')->unique()->count(),
            'views' => $g->where('type', 'pageview')->count(), 'leads' => $g->where('type', 'lead')->count(),
            'demo_opens' => $g->where('type', 'demo_open')->count(), 'whatsapp' => $g->where('type', 'whatsapp')->count()]);
    }
    $this->info("Rolled up {$day->toDateString()}: " . $rows->count() . ' paths');
})->purpose('Fold visitor events into daily totals');

// Raw events older than EVENTS_KEEP_DAYS are deleted (daily totals stay).
Artisan::command('analytics:prune', function () {
    $n = VisitEvent::where('at', '<', now()->subDays(config('content.events_keep_days')))->delete();
    $this->info("Deleted $n old events");
})->purpose('Delete raw visitor events past the keep window');

Schedule::command('analytics:rollup')->dailyAt('00:20')->timezone('Asia/Dhaka');
Schedule::command('analytics:prune')->dailyAt('00:40')->timezone('Asia/Dhaka');
