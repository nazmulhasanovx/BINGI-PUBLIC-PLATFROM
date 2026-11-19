#!/usr/bin/env bash
# One command to run the whole thing on your computer:
#   API   → http://localhost:8000      (Laravel, SQLite file — no MySQL needed locally)
#   Admin → http://localhost:5174      (login printed below)
#   Site  → http://localhost:5173      (reads the admin's published content)
# Needs: PHP 8.3+, Composer, Node 22+.   Stop everything: Ctrl+C
set -e
cd "$(dirname "$0")"
need() { command -v "$1" >/dev/null || { echo "✗ $1 is not installed. Mac: brew install $2"; exit 1; }; }
need php php; need composer composer; need node node; need npm node

echo "→ API"
cd api
[ -f .env ] || { cp .env.example .env; sed -i.bak 's/^SEED_OWNER_PASSWORD=$/SEED_OWNER_PASSWORD=bingi-local-1234/' .env && rm -f .env.bak; }
[ -d vendor ] || composer install --no-interaction
grep -q '^APP_KEY=base64' .env || php artisan key:generate -q
[ -f database/database.sqlite ] || { touch database/database.sqlite; FRESH=1; }
php artisan migrate --force -q
[ -n "$FRESH" ] && php artisan db:seed --force
[ -L public/storage ] || php artisan storage:link -q
cd ..

echo "→ Admin"
cd admin; [ -f .env ] || cp .env.example .env; [ -d node_modules ] || npm install --no-audit --no-fund; cd ..
echo "→ Site"
cd website; [ -d node_modules ] || npm install --no-audit --no-fund; cd ..

trap 'kill 0' EXIT
(cd api && php artisan serve --port 8000 >/dev/null 2>&1) &
(cd admin && npx vite --port 5174 >/dev/null 2>&1) &
sleep 3
# The site builds its content from the API once at start (re-run ./dev.sh after Publish to see changes in dev)
(cd website && CONTENT_API=http://localhost:8000 node scripts/fetch-content.mjs && VITE_API_URL=http://localhost:8000 npx vite --port 5173 >/dev/null 2>&1) &
sleep 3
PW=$(grep '^SEED_OWNER_PASSWORD=' api/.env | cut -d= -f2)
cat <<MSG

  ✓ Running
    Admin  http://localhost:5174   login: owner@bingi.local / ${PW:-"(printed by the seeder above)"}
    Site   http://localhost:5173
    API    http://localhost:8000/api/v1/public/content
  Ctrl+C to stop.
MSG
wait
