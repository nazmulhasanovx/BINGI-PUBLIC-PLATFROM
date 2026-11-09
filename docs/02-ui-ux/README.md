# 02 — UI & UX

Rules applied from BinGi Foundation (visual identity wins) + the **ui-ux-pro-max** skill
(nextlevelbuilder/ui-ux-pro-max-skill: style "Minimalism & Swiss", dials variance 3 · motion 3 · density 3)
+ the zatiqeasy.com reference (motion, buttons, price table).

## Visual system
| Token | Value | Use |
|---|---|---|
| brand | `#B11C29` | primary buttons, popular plan, eyebrow — sparingly |
| brand-soft | `#FBEDEE` | icon tiles, hero glow |
| ink | `#1D1D1F` | text, dark CTA band |
| muted | `#6B7280` | secondary text (4.5:1 on white) |
| canvas | `#F5F6F8` | page background (cool grey) |
| line | `#E5E7EB` | borders |
| link | `#1D4ED8` | text links, focus ring (Ocean Blue, D-B) |
| ok / soon | `#15803D` / `#B45309` | Live / Coming Soon chips |

- Type: Inter (EN) + Hind Siliguri (বাংলা); body 16px, line-height 1.5–1.6; headings 28–56px, tight tracking.
- Radius 12 (cards), 16 (plan cards), 999 (buttons, chips). One soft shadow.
- Icons: Lucide outline, 1.75 stroke. No emoji as icons.
- Light theme only (Pearl Light).

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

## Motion
- Scroll reveal: opacity 0→1 + 12px rise, 350ms ease-out, stagger 40–80ms.
- Hover/press: 150–200ms colour/translate; accordion 200ms.
- `prefers-reduced-motion`: everything shown immediately, no animation.

## Accessibility & interaction (pre-delivery checklist)
- Touch targets ≥ 44px; visible focus ring (blue); skip-to-content link.
- Every icon decorative (`aria-hidden`) or labelled; icon-only buttons have `aria-label`.
- Tabs/segmented controls use `role="tab"` + `aria-selected`; accordion uses `aria-expanded`.
- Form: visible labels, error under the field, focus jumps to first error, `aria-invalid`.
- Language: বাংলা / EN toggle in header (remembered); default বাংলা for Bangladesh visitors; numbers shown in Bangla digits in বাংলা.
