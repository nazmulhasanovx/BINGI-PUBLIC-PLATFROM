# BinGi Public Platform

Public website for **BinGi Hotel Management Technology** — `technology.bingi.com.bd`.
Small site (8 screens), every key fact present: products, live status, pricing, help, contact.

```
BINGI-PUBLIC-PLATFROM/
├── docs/
│   ├── 01-plan/          what we build and why (sitemap, flow, decisions, open items)
│   ├── 02-ui-ux/         design system, layout, motion, device frames, media slots, a11y
│   ├── 03-technology/    stack, folder map, data sources, build & deploy, handoff
│   ├── 04-qa/            test log (one line per check)
│   ├── 05-admin/         admin panel + backend: plan, architecture, API, content types, deploy
│   └── adr/              decisions (one file each)
├── website/              public site — React app (Vite + TypeScript + Tailwind)
├── admin/                admin panel — React app (same UI tokens)
├── api/                  backend — Laravel 12 (content, leads, visitors, SEO, publish)
├── packages/content/     content types + JSON Schema + seed (shared by api, admin, website)
├── theme-demos/          live demos of the hotel website themes
└── motion/               Remotion videos used on the site
```

## Run everything (site + admin + API)

```bash
git checkout develop
./dev.sh          # needs PHP 8.3+, Composer, Node 22+  (Mac: brew install php composer node)
```
Admin http://localhost:5174 (owner@bingi.local / bingi-local-1234) · Site http://localhost:5173 · API http://localhost:8000

## Run the site only

```bash
cd website
npm install
npm run dev            # http://localhost:5173
npm run build          # production build → website/dist (clean URLs)
npm run build:preview  # one self-contained HTML → website/dist-preview/index.html
```

## Edit content without touching code

Use the admin panel (`admin/`, see [docs/05-admin](docs/05-admin/README.md)). Until it is deployed, the files below are the fallback the site builds from.

### Fallback files

| What | File |
|---|---|
| Prices (per room), plans, booking fees, activation, offers | `website/src/data/pricing.ts` |
| Live / Coming Soon status of every module | `website/src/data/status.ts` |
| GIF / video / screenshot slots | `website/src/data/media.ts` + files in `website/public/media/` |
| Help articles, categories, What's new | `website/src/data/help.ts` |
| Phone, address, links | `website/src/data/site.ts` |

Status: v0.1 — 9 Nov 2026. Open decisions in [docs/01-plan](docs/01-plan/README.md#open-decisions).

Branches and PR rules: [CONTRIBUTING.md](CONTRIBUTING.md).
