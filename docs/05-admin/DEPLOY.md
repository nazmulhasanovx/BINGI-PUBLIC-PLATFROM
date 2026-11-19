# Deploy

Status: **not deployed** — runs locally and passes tests; production host still to be chosen (ADR 0001 · D2).

## 1 · API server (`api.technology.bingi.com.bd`)
Small VPS (1 vCPU / 2 GB is plenty): PHP 8.3 (pdo_mysql, gd with WebP, intl, zip), MySQL 8, Nginx, a cron line.

```bash
git clone … && cd BINGI-PUBLIC-PLATFROM/api
cp .env.example .env            # fill the values below
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force     # first time only: today's site content as v1 + the first owner (password printed)
php artisan storage:link
php artisan config:cache && php artisan route:cache
# cron (visitor roll-up and 90-day prune):
* * * * * cd /path/api && php artisan schedule:run >> /dev/null 2>&1
```
Nginx: document root `api/public`, PHP-FPM, `client_max_body_size 16m;`. `packages/content/` must sit next to `api/` (it is read at runtime).

| .env | Value |
|---|---|
| `APP_ENV` / `APP_DEBUG` / `APP_URL` | `production` / `false` / `https://api.technology.bingi.com.bd` |
| `DB_CONNECTION` … | `mysql`, host, `bingi_site`, user, password |
| `SITE_URL` | `https://technology.bingi.com.bd` |
| `SITE_ORIGINS` | `https://technology.bingi.com.bd` |
| `ADMIN_ORIGINS` / `ADMIN_URL` | `https://admin.technology.bingi.com.bd` |
| `MAIL_*` | SMTP for invite and reset emails |
| `BUILD_HOOK_URL` | `https://api.github.com/repos/nazmulhasanovx/BINGI-PUBLIC-PLATFROM/dispatches` |
| `BUILD_HOOK_TOKEN` | fine-grained GitHub token, this repo only, "Contents: read & write" (needed for dispatches) |
| `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` | first owner (change the password after the first login) |
| `LEAD_WEBHOOK_URL` | empty for now (NEC TEAM later) |

## 2 · Admin (`admin.technology.bingi.com.bd`)
Static files: `cd admin && VITE_API_URL=https://api.technology.bingi.com.bd/api/v1 VITE_SITE_URL=https://technology.bingi.com.bd npm run build` → upload `admin/dist`. All paths fall back to `index.html` (SPA). `noindex` is set.

## 3 · Public site (`technology.bingi.com.bd`)
`.github/workflows/site-build.yml` builds on every Publish. Repo secrets: `CONTENT_API`, `SITE_API_URL` (both `https://api.technology.bingi.com.bd`) — then uncomment one deploy block.
Manual build anywhere: `cd website && CONTENT_API=… VITE_API_URL=… npm run build` → `website/dist`.
The build writes `_redirects` (Cloudflare/Netlify) and `redirects.nginx.conf` (Nginx `include`) from the admin's redirects, plus `sitemap.xml` and `robots.txt` from the SEO pages.

If `CONTENT_API` is set and the API is down, the build **fails** on purpose (the live site keeps the last good build). `CONTENT_OPTIONAL=1` builds from the code values instead.

## Order for go-live (A20 → A21)
1. API server + DB + `db:seed` → note the owner password.
2. Admin build → sign in → change the password → invite the team.
3. Repo secrets + deploy block → Publish once from the admin → check the site.
4. Merge `develop` → `main` (release).
