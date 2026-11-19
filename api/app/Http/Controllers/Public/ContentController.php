<?php

namespace App\Http\Controllers\Public;

use App\Content\Publisher;
use App\Http\Controllers\Controller;

/** GET /api/v1/public/content — the latest published snapshot (the site's build reads this). */
class ContentController extends Controller
{
    public function __invoke()
    {
        $s = Publisher::latestOrFail();
        return response($s->content, 200, ['Content-Type' => 'application/json', 'Cache-Control' => 'public, max-age=60', 'X-Content-Version' => (string) $s->version]);
    }
}
