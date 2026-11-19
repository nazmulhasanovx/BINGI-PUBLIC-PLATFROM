# api/ — BinGi site API (Laravel 12)

Content, SEO, media, publish history, leads and visitor analytics for the public site.
Docs: [../docs/05-admin](../docs/05-admin/README.md) · endpoints: [API.md](../docs/05-admin/API.md)

```bash
cp .env.example .env && composer install && php artisan key:generate
touch database/database.sqlite && php artisan migrate --seed   # prints the first owner login
php artisan storage:link && php artisan serve                  # http://localhost:8000
composer test                                                  # Pest
```

| Folder | What |
|---|---|
| `app/Content/` | Registry (reads `packages/content/types.json`), Validator (fields + truth guards), SnapshotBuilder, Publisher |
| `app/Http/Controllers/Admin/` | Admin endpoints (Bearer token, role middleware) |
| `app/Http/Controllers/Public/` | What the website calls: content, leads, events |
| `app/Support/` | ApiError (one error shape), Audit, Visitor (cookie-less hash) |
| `routes/api.php` | Every route, grouped by role |
| `routes/console.php` | `analytics:rollup`, `analytics:prune` (scheduled daily) |
| `tests/Feature/` | Pest tests — one file per area |
