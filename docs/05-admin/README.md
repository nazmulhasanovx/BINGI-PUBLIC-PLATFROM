# 05 — Admin panel & backend

Start here if you are a developer joining the admin work.

| Doc | What it answers |
|---|---|
| [PLAN.md](PLAN.md) | What we build, the 22 modules, the steps |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How admin, API, snapshot and site fit together |
| [API.md](API.md) | Every endpoint, auth, error format |
| [CONTENT_TYPES.md](CONTENT_TYPES.md) | Every content type, its fields, where the site uses it |
| [DEPLOY.md](DEPLOY.md) | Servers, env vars, the publish → build pipeline |
| [../adr/](../adr/) | Why things are the way they are |

## Run everything locally
```bash
# 1. API (http://localhost:8000)
cd api && cp .env.example .env && composer install && php artisan key:generate
php artisan migrate --seed          # SQLite by default; seeds content from packages/content/seed
php artisan serve

# 2. Admin (http://localhost:5174)
cd admin && npm install && npm run dev

# 3. Site, reading the API's published snapshot (http://localhost:5173)
cd website && CONTENT_API=http://localhost:8000 npm run dev
```
First login after seeding: `owner@bingi.local` / password printed by the seeder (change it at once).
