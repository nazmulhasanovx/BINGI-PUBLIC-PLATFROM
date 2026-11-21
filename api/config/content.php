<?php

return [
    // packages/content/types.json — the one definition of every content type
    'registry' => env('CONTENT_REGISTRY', base_path('../packages/content/types.json')),
    'modules' => env('CONTENT_MODULES', base_path('../packages/content/modules.json')),
    'seed_dir' => env('CONTENT_SEED_DIR', base_path('../packages/content/seed')),
    // GitHub repository_dispatch: https://api.github.com/repos/<owner>/<repo>/dispatches
    'build_hook_url' => env('BUILD_HOOK_URL'),
    'build_hook_token' => env('BUILD_HOOK_TOKEN'),
    // Optional: POST every new lead here (NEC TEAM later). Empty = off.
    'lead_webhook_url' => env('LEAD_WEBHOOK_URL'),
    // Where the admin runs (reset / invite links point here)
    'admin_url' => env('ADMIN_URL', 'http://localhost:5174'),
    // Origins allowed to call /api/v1/public/* and the admin API (comma separated)
    'site_origins' => array_filter(explode(',', env('SITE_ORIGINS', 'http://localhost:5173,http://localhost:4173'))),
    'admin_origins' => array_filter(explode(',', env('ADMIN_ORIGINS', 'http://localhost:5174'))),
    // Secret mixed into the daily visitor hash. Rotate any time; old hashes simply stop matching.
    'visitor_salt' => env('VISITOR_SALT', env('APP_KEY')),
    'events_keep_days' => (int) env('EVENTS_KEEP_DAYS', 90),
];
