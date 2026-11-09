# 04 — QA report (site v1 → v2 → v3, 9 Nov 2026)

Built in three versions; each version was tested before the next started.

| Version | What changed | Test result |
|---|---|---|
| v1 | All inner pages on the v2 design system: left-aligned page headers, no eyebrow labels or icon tiles, equal bento heights, display type on Legal/Article/404, footer heading order | 9 routes × desktop + mobile: no errors, no horizontal scroll. Lighthouse desktop 98–99 perf, a11y 100 (heading-order on Legal/404 found and fixed) |
| v2 | Build-time prerender of every route + 404.html, per-page title/description/canonical/OG, hydrate only when HTML matches URL, self-hosted fonts + preload, hero headline rise in CSS, Reveal keeps above-the-fold visible | Mobile LCP was 3.0–3.8 s → now ≤ 2.4 s; no hydration errors; works without JavaScript; client navigation updates titles |
| v3 | Tablet header (logo was hidden at 768 px) → menu below 1024 px; sticky story from 1024 px; segmented pills never wrap text; legal tabs wrap; saved বাংলা applied after hydration (fixed a hydration mismatch) | Automated QA below: no issues |

## Final results (v3)

Lighthouse 12, **mobile, devtools throttling**:

| Page | Perf | A11y | Best practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Home | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| Products | 97 | 100 | 100 | 100 | 2.3 s | 0 |
| Pricing | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| Help | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| Help article | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| Contact | 97 | 100 | 100 | 100 | 2.3 s | 0 |
| Legal | 99 | 100 | 100 | 100 | 1.6 s | 0 |
| Foundation | 97 | 100 | 100 | 100 | 2.4 s | 0 |
| 404 | 96 | 100 | 100 | 100 | 2.3 s | 0 |
Desktop: 98–99 performance on every page.

Automated checks (Playwright, headless Chrome):
- 4 widths (390 / 768 / 1024 / 1440) × 8 pages: no horizontal scroll, no off-screen text.
- বাংলা: toggle works, choice kept after reload, no hydration errors on any page, no overflow at 390 px.
- Reduced motion: 0 elements left hidden in view.
- Keyboard: focus ring visible on every stop (skip link → logo → nav → language → sign in → get started).
- Links: 0 broken internal links. External: bingi.app, hms.bingi.app/login, /register, WhatsApp, phone.
- Pricing maths matches the v4 sheet (10 rooms · 12 months: ৳2,700 / ৳4,500 / ৳10,440).
- Demo form: required-field errors, phone validation, success bubble with WhatsApp send.

## Known gaps (not bugs — waiting on content/decisions)
- Real HMS screenshots / GIFs for 20 media slots.
- Legal text (privacy, terms, refund).
- Mobile apps' store status ("Status to confirm").
- Demo form → lead API (NEC TEAM).
- Free trial wording (undecided).
- Logo as SVG.
