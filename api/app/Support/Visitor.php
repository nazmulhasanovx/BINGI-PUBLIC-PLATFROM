<?php

namespace App\Support;

use App\Models\VisitEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** Cookie-less visitor counting. No raw IP or user agent is stored — only a hash that changes every day. */
class Visitor
{
    public static function hash(Request $r): string
    {
        $salt = config('content.visitor_salt') . now('Asia/Dhaka')->toDateString();
        return substr(hash('sha256', $salt . '|' . $r->ip() . '|' . $r->userAgent()), 0, 16);
    }

    public static function device(?string $ua): string
    {
        $ua = Str::lower((string) $ua);
        if (Str::contains($ua, ['ipad', 'tablet'])) return 'tablet';
        if (Str::contains($ua, ['mobi', 'iphone', 'android'])) return 'mobile';
        return 'desktop';
    }

    public static function isBot(Request $r): bool
    {
        return (bool) preg_match('/bot|crawl|spider|slurp|preview|headless|lighthouse/i', (string) $r->userAgent());
    }

    public static function record(Request $r, string $type, string $path, ?string $referrer = null, ?array $utm = null, ?string $lang = null): void
    {
        $host = $referrer ? parse_url($referrer, PHP_URL_HOST) : null;
        $self = parse_url((string) config('app.site_url'), PHP_URL_HOST);
        VisitEvent::create([
            'at' => now(),
            'type' => $type,
            'path' => '/' . ltrim(Str::before($path, '?'), '/'),
            'referrer_host' => $host && $host !== $self ? Str::lower(Str::after($host, 'www.')) : null,
            'utm' => $utm ? array_intersect_key($utm, array_flip(['source', 'medium', 'campaign'])) : null,
            // Cloudflare / most CDNs send the country; nothing is looked up from the IP here.
            'country' => strtoupper(substr((string) ($r->header('CF-IPCountry') ?? $r->header('X-Country') ?? ''), 0, 2)) ?: null,
            'device' => self::device($r->userAgent()),
            'lang' => $lang,
            'visitor_hash' => self::hash($r),
        ]);
    }
}
