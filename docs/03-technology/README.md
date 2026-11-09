# 03 — Technology

## Stack
| Part | Choice | Why |
|---|---|---|
| Framework | React 19 + TypeScript | team standard, typed content files |
| Build | Vite 8 | fast dev, small output, code-split per page |
| Styling | Tailwind CSS v4 (`@theme` tokens in `src/index.css`) | tokens in one place |
| Routing | react-router-dom 7 (BrowserRouter; HashRouter in single-file preview) | clean URLs |
| Icons | lucide-react | same as HMS (D-C) |
| i18n | tiny context `src/i18n/lang.tsx` — every string is `{ bn, en }` | no library, no key files to sync |

## Folder map

```
website/
├── index.html
├── public/
│   ├── brand/        official logo goes here (bingi-logo.svg)
│   └── media/        screenshots, GIFs, videos for media slots
└── src/
    ├── main.tsx · App.tsx (routes) · index.css (tokens)
    ├── i18n/lang.tsx                 language context, bn digits, ৳ format
    ├── data/                         ALL editable content
    │   ├── pricing.ts                plans, cycles, compare table, offers, priceFor()
    │   ├── status.ts                 module + platform status registry
    │   ├── media.ts                  media slots
    │   ├── help.ts                   help categories, articles, What's new
    │   └── site.ts                   phone, address, links
    ├── components/
    │   ├── layout/   Layout (header, footer, mobile menu), Logo
    │   ├── media/    Devices (StudioDisplay, IPhone16PM), Media (slot renderer)
    │   └── ui/       Ui (SectionHead, Accordion, Segmented), StatusChip, Reveal, Icon
    └── pages/
        ├── home/ · products/ · pricing/ · help/ (index + Article) · contact/ · legal/ · not-found/
```

## Data sources (now → production)
| Data | Now | Production |
|---|---|---|
| Pricing catalog | `data/pricing.ts` (copied from HMS Plan List, 9 Nov 2026) | fetch from the same API as HMS Plan List (Super Admin pricing version) |
| Module status | `data/status.ts` | Super Admin → Content & Web registry |
| Help articles | `data/help.ts` (3 drafts) | shared with in-app "? Help" |
| Demo form | opens WhatsApp with the request | POST to lead API → NEC TEAM |

## Build & deploy
- `npm run build` → `website/dist/` (static). Host on any static host / Nginx / Cloudflare Pages.
- SPA fallback: serve `index.html` for unknown paths.
- 301 redirects on the server (old site URLs):
  ```
  /ecosystem  → /products
  /connected  → /products
  /start      → /pricing
  /training   → /help
  /blog       → /help
  ```
- `npm run build:preview` → one HTML file for review links.

## Quality checks done (9 Nov 2026)
- `tsc` strict build passes.
- All 8 routes rendered in headless Chrome at 1440 and 390: no console errors, no horizontal scroll.

## Developer handoff — what is left
1. Replace `Logo.tsx` wordmark with the official SVG.
2. Fill media slots with real screens/GIFs.
3. Wire pricing + status to the API (keep the same object shape).
4. Demo form → lead API.
5. Meta/OG tags per page, sitemap.xml, robots.txt, analytics.
6. Final legal text.
