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

## 9 Nov 2026 — bento motion loops
- 6 Remotion loops (`/motion`) rendered to MP4 (~1 MB total) and wired into `media.ts`. They autoplay only on screen. Bento media now keep their natural aspect ratio, and video is `object-contain` so nothing is cropped.
- Checked at 1440/820/393: all load (readyState 4), only on-screen videos play. Device × page regression: no issues.
- These are illustrations with sample data, not HMS screen recordings (see motion/README.md).

## 9 Nov 2026 — cleaner bento loops + team section
- Loops redesigned "one moment per card": fewer rows, larger type, designed at the size the card shows on desktop (logical px, rendered sharp at 2.5–4×). Removed the double frame around bento media.
- New "The team behind BinGi" section after FAQ (zatiqeasy pattern): Nazmul Hasan, Md. Yeapas, Md. Abdul Hamim, Most. Shahina Akter. Roles only, no invented bios. Initials until photos arrive (`website/src/data/team.ts`, photos go in `public/team/`).
- 1440/820/393 checked; device × page regression: no issues.

## 9 Nov 2026 — responsive, spacing, soft-minimal pass
- Fixed: mobile horizontal scroll (property-type pills now one scrollable line; `min-w-0`, `overflow-x: clip`), CTA horizon line cutting through "Talk on WhatsApp", pricing booking-fee labels colliding ("MarketplaceWebsite") — now label/value rows.
- Spacing: story steps tighter on desktop (24vh → 14vh), platforms section 2-up phones on mobile, footer links 2 columns on mobile, products media letterbox matches the loop background.
- Soft glow (subtle, few places): `.glow-hover` warm halo on bento + team cards, `.ambient` light behind bento grid, team and the pricing strip, gradient hairline on the pricing strip.
- Video `preload="none"` (loads only when on screen).
- Device × page regression: no issues. Lighthouse mobile home: 90–92 perf (LCP 3.0 s = hero section), a11y/BP/SEO 100. Same score before this pass (92) — the drop from 97 came earlier; follow-up: hero LCP.

## 9 Nov 2026 — less text on phones
- Phones (<640px) hide supporting lines that repeat the heading: story intro, bento card sub-lines, platforms intro + sub-lines, team intro, CTA paragraph, footer tagline, products module/feature descriptions.
- Story steps on phones: numbered list only (no 5 placeholder images). Bento on phones: Booking calendar keeps its loop, the other five become compact 2-up title cards.
- Home on a 393px phone: 8,564 → 5,055 px tall (−41%). Desktop layout unchanged. Device × page regression: no issues.

## 10 Nov 2026 — pricing section (21st.dev "pricing-section" pattern)
- New `src/components/ui/pricing-section.tsx` (+ shadcn `card.tsx`, `timeline-animation.tsx`, `lib/utils.ts` `cn`, `@/` alias). Deps: `@number-flow/react`, `clsx`, `tailwind-merge` (motion, lucide-react already installed).
- Kept from the component: blur timeline reveal, NumberFlow animated prices, gradient sliding switch, icon features + "includes" list with double-check bullets, radial glow, popular ring card.
- Changed to BinGi: coral/brand-red gradients instead of blue, dark ink buttons, Pearl surfaces; real per-room catalogue (Monthly / 6 mo −10% / 12 mo −25%, room stepper, min billing 10, booking fees, activation offer, 4 plans incl. Custom). Offers, compare table and FAQ unchanged.
- Reveal plays on client-side navigation and below the fold; on a direct load the prerendered content stays visible (no LCP/SEO hit).
- Checked 1440/820/393: price switches (৳30 → ৳22.5 on 12 months), min-billing note, no h-scroll, no console errors. Lighthouse mobile /pricing/ 83–84 perf — same as before this change (LCP 3.5 s), a11y/BP/SEO 100.
- Plan recommendation: every card shows "Best for" (Starter → Home/flat, Guest house · Business → Hotel · Ultra → Resort · Custom → Hotel group — same mapping as the home page picker, `propertyTypes` in `data/pricing.ts`). "Your property" picker above the cards marks the fitting plan "Best fit" and dims the others. Small phones: billing switch uses short labels (6 mo / 12 mo); picker wraps. Device × page regression: no issues.

## 10 Nov 2026 — Coral Glow across the system
- Theme + utilities updated (see docs/02-ui-ux "Coral Glow"). Applied: all primary buttons (header, hero, CTA, forms), segmented controls (home property picker, products tabs, pricing switch), headline marks (hero "technology", products "three platforms", help "help", contact "property"), coral light behind every page header, check-dot bullets on home/products/pricing, story step numbers, pricing section now uses the shared utilities.
- Device × page regression: no issues. No console errors.

## 10 Nov 2026 — less text, cleaner (home)
- Story (desktop): only the active step shows its one-line description (smooth reveal); others are titles only.
- Bento: titles only (no sub-lines). Platforms section: no intro line, no sub-lines, no "Status to confirm" chips — device + name only (status stays on the Products page). Final CTA: no paragraph, centred, larger headline.
- Device × page regression: no issues.

## 10 Nov 2026 — activation fees + plan finder
- Activation (Nazmul): Business ৳14,500 → now ৳4,999 · Ultra currently ৳8,999 (regular price not given, so no strike-through) · Starter none. Cards + offers updated; `activation.standard` is now optional in `data/pricing.ts`.
- "Which plan fits your property?" finder above the plan cards: 5 property tiles → plan name, one-line need, 3 reasons (from the plan's entitlements), cost for the entered rooms + cycle, "See <plan>" jumps to the card. Best-fit ring/badge on the matching card stays.
- 1440 + 393 checked; device × page regression: no issues.

## 10 Nov 2026 — 7 new pages
- /solutions (+ /hotel, /resort, /guest-house, /home-stay, /hotel-group), /themes, /blog (+ 3 guides), /customers, /changelog, /partners, /careers. Header nav: Products · Solutions · Themes · Pricing · Help (Contact in the phone menu); footer: Product / Resources / Company.
- Theme screens = the themes repo's own preview images (fictional demo hotels, Unsplash demo photos), converted to WebP (34–109 KB). CITY demo shows a real hotel brand name → logo/name area blurred.
- Truth notes: themes "in final testing" (HMS API wiring next); Theme Store, OTA, payments = Coming soon; Customers = no stories until a hotel gives written permission; Changelog marks each entry Live / In testing / Coming soon; Careers lists roles we hire for, not confirmed openings.
- Device × page regression now 8 devices × 17 pages: no issues. No console errors.

## 10 Nov 2026 — public documentation (/docs) + LLM files
- `/docs` (23 pages: Start here · Platform · 15 modules · Plans & billing · Troubleshooting · Glossary · Support). Each module page: where in the sidebar (Sidebar v6 names = live HMS), plan, status, how-to steps, "Common issues" (symptom → likely causes → fix).
- One source `website/src/data/docs.ts` → pages + `/docs/<slug>.md` + `/llms.txt` + `/llms-full.txt` (rules for AI assistants: answer only from the docs, check plan/role/property, never suggest Coming-soon features, never ask for passwords/OTP). "Copy for AI" per page and "Copy all docs for AI".
- DRAFT v0.1: support must verify every fix against the live HMS (written from Sidebar v6, module rules, pricing data and the 9 Nov staging check).
- Checked: copy buttons (page 1.7 KB, all 23.7 KB), search, titles, 1024 header fits 6 nav items; device × page regression: no issues.

## 10 Nov 2026 — readiness pass (no empty slots)
- Audit: 14 visible "slot:" placeholders (home 10, products 1, help 3), legal pages without text, help articles marked draft.
- Filled hero, platform and story slots with Remotion loops (motion/src/Screens.tsx + resized Calendar/Restaurant/Housekeeping): heroWeb dashboard, heroPhone / platformGuest Guest App, platformWeb calendar, platformMobile HMS Mobile Today, story1 bookings from 3 sources, story2 calendar, story3 check-in (guest + ID + advance), story4 restaurant → room bill, story5 check-out → cleaning task. Sample data, designed illustrations — replace with real recordings when available. ~1 MB total.
- Help "1-minute videos" section hidden until real videos are added to the slots.
- Result: 0 placeholder labels on any page; device × page regression: no issues.
- Still needs the owner: legal text (privacy, terms, refund) after legal review; lead API for the contact form (now hands off to WhatsApp); team photos; real HMS recordings to replace the illustrations.

## 10 Nov 2026 — redesign of 3 sections Nazmul did not like
- Docs: removed the second header bar (title + version chip + big red button); one quiet sidebar (title, search, thin red active marker, "Use with AI" box at the bottom), "On this page" column on wide screens, metadata as one chip row, draft note moved to the page foot.
- Pricing cards: removed reserved empty heights under the price, dropped the "Best for:" label (chips stay), buttons calm white for all plans and red only on the highlighted plan.
- "At the desk…" platforms: one composed scene — display in the centre, the two phones in front of it — with one label row; phone loops re-rendered with larger UI so text is readable.
- Device × page regression: no issues.
