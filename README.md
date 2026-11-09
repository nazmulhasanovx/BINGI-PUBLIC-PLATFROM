# BinGi Public Platform

Public website for **BinGi Hotel Management Technology** — `technology.bingi.com.bd`.
Small site (8 screens), every key fact present: products, live status, pricing, help, contact.

```
BINGI-PUBLIC-PLATFROM/
├── docs/
│   ├── 01-plan/          what we build and why (sitemap, flow, decisions, open items)
│   ├── 02-ui-ux/         design system, layout, motion, device frames, media slots, a11y
│   └── 03-technology/    stack, folder map, data sources, build & deploy, handoff
└── website/              React app (Vite + TypeScript + Tailwind)
```

## Run

```bash
cd website
npm install
npm run dev            # http://localhost:5173
npm run build          # production build → website/dist (clean URLs)
npm run build:preview  # one self-contained HTML → website/dist-preview/index.html
```

## Edit content without touching pages

| What | File |
|---|---|
| Prices, plans, booking fees, offers | `website/src/data/pricing.ts` |
| Live / Coming Soon status of every module | `website/src/data/status.ts` |
| GIF / video / screenshot slots | `website/src/data/media.ts` + files in `website/public/media/` |
| Help articles, categories, What's new | `website/src/data/help.ts` |
| Phone, address, links | `website/src/data/site.ts` |

Status: v0.1 — 9 Nov 2026. Open decisions in [docs/01-plan](docs/01-plan/README.md#open-decisions).
