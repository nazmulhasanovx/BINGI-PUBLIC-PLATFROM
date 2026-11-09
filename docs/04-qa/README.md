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


---

# Responsive rounds (9 Nov 2026, after founder review)
Founder feedback: too much space in many places; the Apple monitor didn't feel cinematic / bezel-less;
check on real device ratios; on phones make type and elements much smaller so more fits on one screen.
Three fix + test rounds on real device viewports:
iPhone SE (375×667), iPhone 16 (393×852), iPhone 16 Pro Max (440×956), Pixel 7 (412×915),
Galaxy S8 (360×740), Galaxy S9+ (320×658), iPad Mini (768×1024), iPad Pro 11 (834×1194).
Checks per device × 8 pages: horizontal scroll, off-screen text, tap targets < 40 px, text < 12 px,
text spilling out of buttons, overlapping tab labels, JS errors.

| Round | Changes | Test found |
|---|---|---|
| 1 | Spacing −30–40 % (sections, hero, story, footer); cinematic Studio Display (hairline aluminium rim, 1.6 % bezel, glass glare, real neck + foot + floor shadow); iPhone 16 Pro Max with titanium band, side buttons, glare | small tap targets (logo, inline links, slider, breadcrumb), 11 px text on Foundation; phones: hero product below the fold, pricing period tabs breaking into rows, product tabs cut off |
| 2 | Phone-sized hero; iOS segmented control fills the row on phones; 44 px targets; Foundation overflow fixed | visual check: pricing period labels overlapped on 320–375 px phones (added an automatic overlap check) |
| 3 | Segments stack label over badge on phones; **mobile density layer** (< 640 px): type −15–25 %, padding/gaps −25–40 %, controls 40 px, header 54 px | **no issues** on all 8 devices; Lighthouse mobile 97–99 perf, a11y/BP/SEO 100 |

Mobile density result (iPhone 16): home page 9,687 → 7,983 px tall (−18 %), pricing 4,810 → 4,048 px (−16 %).
Floors kept on purpose: text ≥ 12 px, tap targets ≥ 40 px (Apple HIG recommends 44 pt).

## 9 Nov 2026 — spacing + tablet density
- Pricing cards: removed reserved heights / forced equal heights below desktop; features in 2 columns on tablet. Plan grid height 768px: 1333 → 1105px; phone 393px: 2188 → 1808px. Desktop 4-column unchanged.
- Tablet density layer (640–1023px) in `index.css`: type ~85–90%, tighter padding/gaps, smaller buttons.
- Home "three platforms" (tablet): monitor full row capped at 640px, the two phones side by side (max 240px). Device × page regression: no issues.
