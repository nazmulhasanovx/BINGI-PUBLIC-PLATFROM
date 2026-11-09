# 02 — UI & UX

## Mobile density (phones < 640 px)
Founder direction: smaller type and tighter elements on phones so one screen shows more.
Implemented as one central layer at the end of `src/index.css` (no per-file edits): type −15–25 %
(body 14 px, lead 14 px, section titles 25 px, hero 31–34 px), padding and gaps −25–40 %, buttons and
controls 40 px, header 54 px. Floors: text ≥ 12 px, tap targets ≥ 40 px.

## Device frames (cinematic)
Studio Display: hairline aluminium rim, ultra-thin 1.6 % black bezel, diagonal glass glare, slim neck, foot and soft floor shadow.
iPhone 16 Pro Max: thin titanium band, 1.6 % bezel, Dynamic Island, Action/volume/side/Camera Control buttons, same glare.

## Motion system — Apple OS smooth + Telegram touches (9 Nov 2026)
Founder direction: motion should feel like Apple OS; Telegram patterns allowed in some places.

**Springs, not curves.** Physical springs (interruptible, keep velocity), defined once in `src/lib/motion.ts`
and mirrored for CSS as `linear()` curves in `src/index.css`:

| Token | Feel | Physics | Settles | Used for |
|---|---|---|---|---|
| `ios` / `--ease-spring` | iOS sheet / navigation | response 0.42 s, damping 0.82 | ~540 ms, 1% overshoot | panels, accordion, page enter, card hover, mobile menu |
| `snappy` / `--ease-snappy` | iOS controls | response 0.30 s, damping 0.90 | ~280 ms, no bounce | buttons, segmented pills, toggles, chevrons |
| `bouncy` / `--ease-bouncy` | Telegram pop | response 0.45 s, damping 0.68 | ~690 ms, 5% overshoot | rolling digits, message-bubble pop |
Exits are faster than entries (180 ms fade). Buttons press to 0.96 in 100 ms and spring back.

**Apple patterns**
- Segmented control: the selected pill slides between options (shared layout) — pricing period, language, property types, product tabs.
- Disclosure: accordion height springs open; chevron rotates on the same spring.
- Sheet: mobile menu drops from the top-right with a spring and blur material; items cascade 30 ms apart.
- Page change: fade + 8 px rise on the iOS spring.
- Scroll: Lenis inertia on desktop pointers; product display tilts flat as you scroll (hero).

**Telegram patterns**
- Rolling digits: prices roll digit-by-digit when period or rooms change (`<NumberRoll>`), Bangla digits supported.
- Bubble pop: success states scale up from their corner with a soft overshoot (`<Bubble>`), e.g. demo request ready.
- Folder tabs: same sliding pill as the iOS segmented control.

**Rules:** transform/opacity only · max 1–2 moving things per view · no motion on page load except the hero sequence · `prefers-reduced-motion` = instant, final state.

## Foundation (theme) — shadcn / 21st.dev format
**Decision (Nazmul, 9 Nov 2026): the site uses the light preset — BinGi Pearl.** BinGi Bay (dark) stays in the file only as a token reference; the site does not switch to dark mode.

Following the 21st.dev Theme Editor pattern (founder direction, 9 Nov 2026), all colours, type, radius and
shadow live in ONE file: `website/src/styles/bingi-theme.css` (copy: `docs/02-ui-ux/bingi-theme.css`).
Same structure as 21st themes — `:root` (preset **BinGi Pearl**, light) · `.dark` (preset **BinGi Bay**) · `@theme inline` — so it pastes straight into the 21st Theme Editor or any shadcn app.

| Group | Pearl (light) | Bay (dark) | Text contrast |
|---|---|---|---|
| primary / fg | #B11C29 / #FFF | #FF6B66 / #08131F | 6.85 · 6.72 |
| secondary / fg (Ocean Blue, D-B) | #1D4ED8 / #FFF | #8AA8FF / #08131F | 6.70 · 8.12 |
| accent / fg | #FCEDEE / #8E1621 | #2A1A22 / #FFB3B0 | 8.08 · 9.71 |
| background / fg | #F4F6F8 / #0F1720 | #08131F / #EEF2F6 | 16.66 · 16.62 |
| card / fg | #FFF / #0F1720 | #0F2236 / #EEF2F6 | 18.05 · 14.33 |
| muted / fg | #E9EDF2 / #4D5664 | #15304A / #B4C0CD | 6.31 · 7.31 |
| destructive / fg | #C81E1E / #FFF | #F87171 / #08131F | 5.74 · 6.76 |
| border · input · ring | #E3E7EC · #858C97 · #1D4ED8 | #1F3A55 · #5E7C98 · #8AA8FF | input ≥3:1 |
| chart 1–5 | red · blue · green · amber · bay | lighter set | — |
| radius | 0.75rem | | |
| fonts | Instrument Sans · Bricolage Grotesque · Hind Siliguri | | |

Site-only aliases (brand, ink, pearl, line…) in `src/index.css` point to these variables — change the theme file and the whole site follows.
**Live preview:** `/foundation` page — left panel = preset + token groups (Colors · Type · Radius · Shadow, "Copy theme CSS"), right = Dashboard, Forms, Team, Pricing rendered with the tokens (numbers labelled "Sample data").

## v2 (9 Nov 2026) — current
v0.1 was rated 2/10 by the founder (placeholders, card soup, flat colour, generic type, fade-up only).
v2 follows the plan in the BINGI HMT project (`Public_Site_UI_v2_Plan.md`), built with the frontend-design
and ui-ux-pro-max skills and one 21st.dev component (Scroll 01, adapted).

**Signature — "Bay sunrise":** the coral horizon of Cox's Bazar, where BinGi started. A thin coral→peach
horizon line with a soft sunrise glow, used only twice: hero and closing CTA. Everything else stays quiet.

| Token | Value | Use | Contrast |
|---|---|---|---|
| pearl | `#F4F6F8` | canvas | — |
| ink | `#0F1720` | text | 16.7 on pearl |
| muted | `#4D5664` | secondary text | 6.9 pearl · 7.4 white · 6.2 on sunrise |
| soft | `#616A77` | tertiary | ≥4.7 |
| bay | `#0B2235` | the one dark section + CTA | white/75 = 9.6 |
| coral / sun | `#FD413F` / `#FFB38A` | logo + sunrise only | decorative |
| brand | `#B11C29` | primary action only | white text 6.85 |

Type: **Bricolage Grotesque** (display, tracking −3.5%, hero 76px) + **Instrument Sans** (text, 17–19px) + Hind Siliguri (বাংলা).
No ALL-CAPS labels, no arrows in buttons, no icon tiles, one gradient border per view.

Motion (Motion for React + Lenis):
- One orchestrated load: headline lines rise in sequence, horizon draws in, sunrise brightens.
- Scroll-linked product reveal: Studio Display tilts from 24° to flat and grows; iPhone rises after it.
- Sticky story (5 numbered steps — a real sequence): text scrolls, the display swaps screens; progress dots.
- Bento tiles: light follows the cursor (pointer-triggered only).
- Modules marquee, pauses on hover. Lenis smooth scroll on desktop pointers only.
- Reduced motion: everything static and fully visible.

Measured (Lighthouse 12): desktop 99 / 100 / 100 / 100 · mobile 89 / 100 / 100 / 100, CLS 0.
Mobile LCP 3.4 s on simulated slow 4G — fix = prerender pages to static HTML (next step).

---

## v0.1 notes (kept for history)

Rules applied from BinGi Foundation (visual identity wins) + the **ui-ux-pro-max** skill
(nextlevelbuilder/ui-ux-pro-max-skill: style "Minimalism & Swiss", dials variance 3 · motion 3 · density 3)
+ the zatiqeasy.com reference (motion, buttons, price table).

## Visual system
| Token | Value | Use |
|---|---|---|
| brand | `#B11C29` | primary buttons, popular plan, eyebrow — sparingly |
| brand-soft | `#FBEDEE` | icon tiles, hero glow |
| ink | `#1D1D1F` | text, dark CTA band |
| muted | `#5B6170` | secondary text (6.2 white · 5.7 canvas · 5.1 hero glow) |
| canvas | `#F5F6F8` | page background (cool grey) |
| line | `#E5E7EB` | decorative card borders only |
| line-strong | `#8A919C` | inputs & controls (3.2:1, WCAG non-text) |
| logo red | `#FD413F` | **logo only** — never for UI |
| link | `#1D4ED8` | text links, focus ring (Ocean Blue, D-B) |
| ok / soon | `#166534` / `#92400E` | Live / Coming Soon chips (6.4:1) |

- Type: Inter (EN) + Hind Siliguri (বাংলা); body 16px, line-height 1.5–1.6; headings 28–56px, tight tracking.
- Radius 12 (cards), 16 (plan cards), 999 (buttons, chips). One soft shadow.
- Icons: Lucide outline, 1.75 stroke. No emoji as icons.
- Light theme only (Pearl Light).

## Contrast audit (9 Nov 2026, measured)
| Element | Before | After |
|---|---:|---:|
| Muted text on canvas | 4.47 ✗ | 5.73 ✓ |
| Muted text on hero glow | 4.01 ✗ | 5.14 ✓ |
| Light text on red Business card | 3.79 ✗ | 4.90 ✓ (white/90) |
| Input / control borders | 1.24 ✗ | 3.18 ✓ |
| Compare "not included" mark | 1.24 ✗ | 5.73 ✓ + screen-reader text |
| Live / Coming Soon chips | 4.47 / 4.58 | 6.35 / 6.46 ✓ |
Minimum text size 12px (was 11px). Rule: never colour alone — every ✓/– and chip also has text.

## Logo
Official PNG in `website/src/assets/bingi-logo.png` (copy in `public/brand/`). Favicon + Apple touch icon cut from the logo mark. An SVG version is still wanted for perfect sharpness.

## Layout
- Container 1200px, 20px side padding on mobile.
- Breakpoints tested: 390 · 768 · 1024 · 1440. No horizontal scroll (checked).
- Hero: centered text, pill eyebrow, pill CTA with arrow, soft radial glow (zatiq-style).
- Plan cards: popular card fully brand red, lifted, "MOST POPULAR" tab; booking-fee box at card bottom.

## Device frames
| Frame | Used for | Media size |
|---|---|---|
| Apple Studio Display 27" (16:9, black bezel, aluminium stand) | HMS Web | 2560 × 1440 |
| iPhone 16 Pro Max (440 × 956 pt, Dynamic Island, titanium) | HMS Mobile, Guest App | 1320 × 2868 |

Components: `components/media/Devices.tsx` → `<StudioDisplay media="…" />`, `<IPhone16PM media="…" />`.

## Media slots (custom GIFs)
All slots live in `website/src/data/media.ts`. Put the file in `website/public/media/` and set `src`, e.g.
`heroWeb: { src: '/media/hero-dashboard.mp4', … }`. Empty `src` shows a labelled placeholder.
Prefer **.mp4 / .webm** (autoplay, muted, loop) over .gif — 5–10× smaller.

| Slot | Where | Size | Content |
|---|---|---|---|
| heroWeb | Home hero, Studio Display | 2560×1440 | HMS Dashboard |
| heroPhone | Home hero, iPhone | 1320×2868 | Guest App Home |
| platformWeb | Home + Products | 2560×1440 | Booking Calendar |
| platformMobile | Home + Products | 1320×2868 | HMS Mobile Today |
| platformGuest | Home + Products | 1320×2868 | Guest App hotel / booking |
| chain | Home, booking chain | 1600×900 | one booking flowing website → report |
| bentoCalendar | Products (Web) | 1200×750 | drag a booking |
| bentoHousekeep | Products (Web) | 1200×750 | checkout → cleaning task |
| bentoRestaurant | Products (Web) | 1200×750 | POS → room bill |
| bentoWebsite | Products (Web) | 1200×750 | website theme switch |
| helpVideo1–3 | Help | 1280×720 | 1-min Bangla videos |

Use **real BinGi screens only**. No fake UI.

## Motion, glow & shadow (SaaS feel — founder direction 9 Nov 2026)
- Hero: faint grid + 3 slow-drifting blurred colour orbs (red, blue, peach; 14–20s loops) + coloured glow behind the devices.
- Primary button: red gradient, red glow shadow, lifts 1px on hover; hero CTA has a light "shine" sweep.
- Cards: lift 4px + bigger shadow + faint red border on hover (300ms). Highlighted cards get a red→blue gradient border.
- Popular plan: gradient red card, lifted, deep red glow shadow.
- Dark CTA band: two drifting glow orbs.
- Live status dot: soft green pulse ring.
- Scroll reveal: opacity 0→1 + 12px rise, 600ms ease-out-quint, stagger 40–80ms. Hero text is NOT hidden by reveal (faster first paint).
- Spring easing `--ease-spring` cubic-bezier(0.34,1.4,0.64,1) on card hover, buttons (press = scale 0.98), tabs.
- Page change: 320ms fade + 10px rise.
- Glow orbs: blur 80px, animated on desktop only (static on phones), `will-change: transform`.
- Videos in media slots play only while on screen.
- Nav links prefetch the next page on hover / focus / touch.
- Mobile: sticky "Get started + WhatsApp" bar appears after 480px scroll (safe-area aware).
- Shadows: `shadow-soft` (rest), `shadow-lift` (hover/featured), `shadow-glow` (brand actions) — tokens in `src/index.css`.
- `prefers-reduced-motion`: all animation off, content shown immediately.

## Measured quality (Lighthouse 12, 9 Nov 2026)
| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Home — mobile (slow 4G sim) | 94 | 100 | 100 | 100 | 2.8 s | 0 |
| Pricing — mobile | 91 | 100 | 100 | 100 | 3.1 s | 0 |
| Home — desktop | 100 | 100 | 100 | 100* | 0.5 s | 0 |
*desktop SEO measured before robots.txt was added (92 → expected 100).
Next step for mobile LCP < 2.5 s: prerender each page to static HTML at build time.

## Accessibility & interaction (pre-delivery checklist)
- Touch targets ≥ 44px; visible focus ring (blue); skip-to-content link.
- Every icon decorative (`aria-hidden`) or labelled; icon-only buttons have `aria-label`.
- Tabs/segmented controls use `role="tab"` + `aria-selected`; accordion uses `aria-expanded`.
- Form: visible labels, error under the field, focus jumps to first error, `aria-invalid`.
- Language: **English is the site language** (founder direction 9 Nov 2026). বাংলা remains available from the header toggle (remembered per browser); in বাংলা numbers show in Bangla digits.
