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
