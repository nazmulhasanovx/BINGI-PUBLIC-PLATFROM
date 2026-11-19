# BinGi Public Platform — Server Setup Guide

এই guide মেনে চললে তিনটা জিনিস live হবে:

| অংশ | ঠিকানা | কী |
|---|---|---|
| Public site | `https://technology.bingi.com.bd` | হোটেল মালিকরা যেটা দেখে |
| Admin panel | `https://admin.technology.bingi.com.bd` | টিম যেখান থেকে content, SEO, লিড, ভিজিটর manage করে |
| API (backend) | `https://api.technology.bingi.com.bd` | admin আর site-এর ডেটা রাখে |

সময় লাগবে ১–২ ঘণ্টা। নিচের ধাপগুলো ক্রমানুসারে করুন। প্রতিটা ধাপের শেষে **✓ চেক** আছে — সেটা ঠিক না হলে পরের ধাপে যাবেন না।

> নিজের কম্পিউটারে শুধু চালিয়ে দেখতে চাইলে এই guide লাগবে না: `git checkout develop && ./dev.sh` (README দেখুন)।

---

## ০ · যা আগে থেকে লাগবে

| জিনিস | বিস্তারিত |
|---|---|
| একটা VPS | Ubuntu 24.04, কমপক্ষে 1 vCPU / 2 GB RAM / 25 GB disk। একটা server-এই তিনটা অংশ চলবে |
| DNS access | `bingi.com.bd` domain-এর DNS panel |
| SMTP | ইমেইল পাঠানোর জন্য (Zoho, Gmail Workspace, Mailgun, Brevo — যেকোনো একটা)। Invite ও পাসওয়ার্ড রিসেট ইমেইল এটা দিয়ে যায় |
| GitHub access | এই repo-র Settings → Secrets বদলানোর অনুমতি |

---

## ১ · DNS

DNS panel-এ তিনটা **A record** দিন, তিনটাই VPS-এর IP-তে:

| Name | Type | Value |
|---|---|---|
| `technology` | A | `<VPS IP>` |
| `admin.technology` | A | `<VPS IP>` |
| `api.technology` | A | `<VPS IP>` |

**✓ চেক:** `ping api.technology.bingi.com.bd` → VPS-এর IP দেখায় (DNS ছড়াতে ৫–৩০ মিনিট লাগতে পারে)।

---

## ২ · Server-এ দরকারি software

VPS-এ SSH করে ঢুকুন (`ssh root@<VPS IP>`), তারপর:

```bash
apt update && apt upgrade -y
apt install -y nginx mysql-server git unzip curl certbot python3-certbot-nginx \
  php8.3-fpm php8.3-cli php8.3-mysql php8.3-gd php8.3-intl php8.3-zip php8.3-mbstring php8.3-xml php8.3-curl php8.3-bcmath

# Composer
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Node 22 (admin build করার জন্য)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs

# deploy করার জন্য আলাদা user (root দিয়ে site চালাবেন না)
adduser --disabled-password --gecos "" deploy
usermod -aG www-data deploy
```

**✓ চেক:** `php -v` → 8.3 · `composer -V` · `node -v` → v22 · `mysql --version`

---

## ৩ · Database

```bash
mysql
```
MySQL-এর ভেতরে (পাসওয়ার্ড নিজে একটা শক্ত পাসওয়ার্ড দিন, কোথাও লিখে রাখুন):
```sql
CREATE DATABASE bingi_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'bingi_site'@'localhost' IDENTIFIED BY 'এখানে-শক্ত-পাসওয়ার্ড';
GRANT ALL PRIVILEGES ON bingi_site.* TO 'bingi_site'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## ৪ · কোড নামানো

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/nazmulhasanovx/BINGI-PUBLIC-PLATFROM.git bingi
cd bingi
git checkout develop        # main-এ merge হওয়ার পর: git checkout main
chown -R deploy:www-data /var/www/bingi
```

> `api/` আর `packages/content/` পাশাপাশি থাকতে হবে — API চলার সময় `packages/content/types.json` পড়ে। তাই পুরো repo clone করুন, শুধু `api/` না।

---

## ৫ · API (backend)

```bash
cd /var/www/bingi/api
sudo -u deploy cp .env.example .env
sudo -u deploy composer install --no-dev --optimize-autoloader --no-interaction
sudo -u deploy php artisan key:generate
nano .env          # নিচের টেবিল অনুযায়ী বদলান
```

`.env`-এ যা বদলাতে হবে:

| Key | Value |
|---|---|
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_URL` | `https://api.technology.bingi.com.bd` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` / `DB_PORT` | `127.0.0.1` / `3306` |
| `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` | `bingi_site` / `bingi_site` / ধাপ ৩-এর পাসওয়ার্ড |
| `SITE_URL` | `https://technology.bingi.com.bd` |
| `SITE_ORIGINS` | `https://technology.bingi.com.bd` |
| `ADMIN_ORIGINS` | `https://admin.technology.bingi.com.bd` |
| `ADMIN_URL` | `https://admin.technology.bingi.com.bd` |
| `MAIL_MAILER` | `smtp` |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` / `MAIL_ENCRYPTION` | আপনার SMTP-এর তথ্য |
| `MAIL_FROM_ADDRESS` / `MAIL_FROM_NAME` | যেমন `no-reply@bingi.com.bd` / `"BinGi"` |
| `SEED_OWNER_EMAIL` | প্রথম ওনারের ইমেইল (যেমন আপনার নিজের) |
| `SEED_OWNER_PASSWORD` | খালি রাখুন — seeder নিজে একটা পাসওয়ার্ড বানিয়ে দেখাবে |
| `BUILD_HOOK_URL` | `https://api.github.com/repos/nazmulhasanovx/BINGI-PUBLIC-PLATFROM/dispatches` |
| `BUILD_HOOK_TOKEN` | ধাপ ৯-এ বানানো GitHub token (এখন খালি রাখা যায়) |
| `LEAD_WEBHOOK_URL` | খালি (NEC TEAM-এ পাঠানো পরে চালু হবে) |

তারপর:
```bash
sudo -u deploy php artisan migrate --force
sudo -u deploy php artisan db:seed --force     # শুধু প্রথমবার! এখনকার site-এর সব লেখা ঢোকায় + ওনার বানায়
sudo -u deploy php artisan storage:link
sudo -u deploy php artisan config:cache && sudo -u deploy php artisan route:cache
chmod -R 775 storage bootstrap/cache && chown -R deploy:www-data storage bootstrap/cache
```

`db:seed` চালানোর পর screen-এ এরকম একটা লাইন আসবে — **এটা কপি করে রাখুন**:
```
Owner login: you@bingi.com.bd / Xy7k...  — change this password after the first login.
```

রোজ রাতে ভিজিটর হিসাব গুছানোর জন্য cron:
```bash
crontab -u deploy -e
# এই লাইনটা যোগ করুন:
* * * * * cd /var/www/bingi/api && php artisan schedule:run >> /dev/null 2>&1
```

---

## ৬ · Admin panel build

```bash
cd /var/www/bingi/admin
cat > .env <<'EOF'
VITE_API_URL=https://api.technology.bingi.com.bd/api/v1
VITE_SITE_URL=https://technology.bingi.com.bd
EOF
sudo -u deploy npm ci && sudo -u deploy npm run build      # → admin/dist
```

---

## ৭ · Nginx (তিনটা site)

`/etc/nginx/sites-available/bingi` ফাইল বানান:

```nginx
# ---------- API ----------
server {
    listen 80;
    server_name api.technology.bingi.com.bd;
    root /var/www/bingi/api/public;
    index index.php;
    client_max_body_size 16m;

    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    }
    location ~ /\.(?!well-known) { deny all; }
}

# ---------- Admin (single-page app) ----------
server {
    listen 80;
    server_name admin.technology.bingi.com.bd;
    root /var/www/bingi/admin/dist;
    add_header X-Robots-Tag "noindex, nofollow" always;
    location / { try_files $uri /index.html; }
}

# ---------- Public site (static, prerendered) ----------
server {
    listen 80;
    server_name technology.bingi.com.bd;
    root /var/www/site;
    error_page 404 /404.html;

    include /var/www/site/redirects.nginx.conf;      # admin → SEO → Redirects থেকে তৈরি হয়
    location / { try_files $uri $uri/index.html =404; }
    location /assets/ { expires 1y; add_header Cache-Control "public, immutable"; }
}
```

```bash
mkdir -p /var/www/site && chown deploy:www-data /var/www/site
touch /var/www/site/redirects.nginx.conf          # প্রথম build-এর আগে খালি ফাইল থাকতে হবে
ln -s /etc/nginx/sites-available/bingi /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# HTTPS (তিনটা ঠিকানার জন্য একসাথে)
certbot --nginx -d technology.bingi.com.bd -d admin.technology.bingi.com.bd -d api.technology.bingi.com.bd
```

**✓ চেক:**
- `https://api.technology.bingi.com.bd/api/v1/public/content` → লম্বা JSON আসে, শেষে `"meta":{"version":1,...}`
- `https://admin.technology.bingi.com.bd` → লগইন পেজ আসে

---

## ৮ · প্রথম লগইন

1. `https://admin.technology.bingi.com.bd` খুলুন, ধাপ ৫-এর ওনার ইমেইল ও পাসওয়ার্ড দিয়ে ঢুকুন।
2. উপরে ডানে নাম → **পাসওয়ার্ড বদলান** → নতুন পাসওয়ার্ড দিন (কমপক্ষে ১০ অক্ষর)।
3. **ইউজার ও রোল** → **ইনভাইট** দিয়ে টিমকে যোগ করুন (ওনার / এডিটর / সেলস)। তারা ইমেইলে পাসওয়ার্ড সেট করার লিংক পাবে।

**✓ চেক:** ইনভাইট ইমেইল আসে। না এলে `.env`-এর `MAIL_*` ঠিক নেই (ধাপ ১১ দেখুন)।

---

## ৯ · Publish করলে site যেন নিজে থেকে আপডেট হয় (GitHub)

### ৯.১ · Site build-এর জন্য deploy key
VPS-এ:
```bash
sudo -u deploy ssh-keygen -t ed25519 -f /home/deploy/.ssh/github_deploy -N ""
cat /home/deploy/.ssh/github_deploy.pub >> /home/deploy/.ssh/authorized_keys
cat /home/deploy/.ssh/github_deploy          # এই private key টা GitHub secret-এ যাবে

# deploy user যেন redirect বদলের পর Nginx reload করতে পারে (শুধু এই দুটো কমান্ড)
echo 'deploy ALL=(root) NOPASSWD: /usr/sbin/nginx -t, /bin/systemctl reload nginx' > /etc/sudoers.d/deploy-nginx && chmod 440 /etc/sudoers.d/deploy-nginx
```

### ৯.২ · GitHub secrets
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Value |
|---|---|
| `CONTENT_API` | `https://api.technology.bingi.com.bd` |
| `SITE_API_URL` | `https://api.technology.bingi.com.bd` |
| `SITE_HOST` | VPS-এর IP |
| `SITE_SSH_KEY` | ৯.১-এর private key (পুরোটা, `-----BEGIN` থেকে `END-----` পর্যন্ত) |

### ৯.৩ · Workflow-এ deploy চালু
`.github/workflows/site-build.yml`-এর শেষে "VPS over SSH" block-এর `#` সরিয়ে দিন, commit করুন।

### ৯.৪ · API-কে GitHub চালানোর অনুমতি
GitHub → আপনার profile → **Settings → Developer settings → Fine-grained tokens → Generate new token**:
- Repository access: শুধু `BINGI-PUBLIC-PLATFROM`
- Permissions: **Contents: Read and write**
- Token কপি করে VPS-এর `api/.env`-এ `BUILD_HOOK_TOKEN=` এর পরে বসান, তারপর `sudo -u deploy php artisan config:cache`

**✓ চেক:** GitHub → **Actions → Site build (after Publish) → Run workflow** চালান → সবুজ ✓ → `https://technology.bingi.com.bd` খোলে।

---

## ১০ · শেষ চেক (সব ঠিক আছে কিনা)

| # | কী করবেন | কী হওয়া উচিত |
|---|---|---|
| 1 | Admin → টিম → কারো পদবি একটু বদলে সেভ | "বদলানো · পাবলিশ বাকি" দেখায়; site এখনো বদলায়নি |
| 2 | Admin → পাবলিশ → **পাবলিশ** | v2 তৈরি হয়; ২–৫ মিনিট পর GitHub Actions-এ build সবুজ |
| 3 | Site-এ টিম সেকশন দেখুন | নতুন পদবি দেখায় |
| 4 | Admin → পাবলিশ → হিস্টরি → v1-এ **এটায় ফিরুন** | ২–৫ মিনিট পর site আগের মতো |
| 5 | Site-এ "ডেমো বুক করুন" ফর্ম পূরণ করুন | Admin → লিড-এ নতুন লিড আসে |
| 6 | কয়েকটা পেজ ঘুরে পরদিন Admin → ভিজিটর | সংখ্যা দেখায় (headless bot গোনা হয় না) |

সব ঠিক হলে `develop` → `main` merge করুন (GitHub-এ Pull request খুলে)।

---

## ১১ · সমস্যা হলে

| সমস্যা | কারণ ও সমাধান |
|---|---|
| Admin-এ "Cannot reach the server" | API চলছে না বা ঠিকানা ভুল। `admin/.env`-এর `VITE_API_URL` দেখুন, admin আবার build করুন |
| Admin লগইনে CORS error (browser console) | `api/.env`-এর `ADMIN_ORIGINS` ঠিক ঠিকানা কিনা দেখুন (শেষে `/` ছাড়া), তারপর `php artisan config:cache` |
| Site-এর ডেমো ফর্ম লিড যায় না | `SITE_ORIGINS` ঠিক কিনা দেখুন; GitHub secret `SITE_API_URL` সেট আছে কিনা |
| ইমেইল যায় না | `MAIL_*` ভুল। পরীক্ষা: `php artisan tinker` → `Mail::raw('test', fn($m) => $m->to('you@x.com')->subject('test'));` |
| Publish হয় কিন্তু site বদলায় না | পাবলিশ হিস্টরিতে "build শুরু হয়নি" লেখা থাকলে `BUILD_HOOK_TOKEN` ভুল/মেয়াদ শেষ। GitHub Actions-এ লাল ✗ থাকলে log দেখুন |
| ছবি আপলোড হয় না | `client_max_body_size 16m` আছে কিনা; `storage` ফোল্ডারের permission (ধাপ ৫) |
| 500 error | `tail -50 /var/www/bingi/api/storage/logs/laravel.log` |

---

## ১২ · পরে কোড আপডেট করতে

```bash
cd /var/www/bingi && sudo -u deploy git pull
cd api && sudo -u deploy composer install --no-dev --optimize-autoloader && sudo -u deploy php artisan migrate --force && sudo -u deploy php artisan config:cache && sudo -u deploy php artisan route:cache
cd ../admin && sudo -u deploy npm ci && sudo -u deploy npm run build
```
Site-এর কোড বদলালে GitHub Actions → **Site build → Run workflow**।

> **কখনো আবার `db:seed` চালাবেন না** — প্রথমবারের পরে content admin-এ থাকে।
> Backup: রোজ `mysqldump bingi_site > /root/backup/bingi_site_$(date +%F).sql` আর `api/storage/app/public` ফোল্ডার।

---

বিস্তারিত প্রযুক্তিগত তথ্য (developer-দের জন্য): [`docs/05-admin/`](docs/05-admin/README.md) · API: [`docs/05-admin/API.md`](docs/05-admin/API.md) · সিদ্ধান্ত: [`docs/adr/0001-admin-backend-decisions.md`](docs/adr/0001-admin-backend-decisions.md)
