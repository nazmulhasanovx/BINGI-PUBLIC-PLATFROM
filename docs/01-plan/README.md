# 01 — Plan

## Goal
Replace the current `technology.bingi.com.bd` with a **small** public site: few pages, but all key information.
A visitor should understand → trust → **Get started** (HMS register) or **Book a demo**.

Founder direction (9 Nov 2026):
- Not a large website. No extra pages that add development work and user hassle.
- UI not complex, but not too little information either.
- Show all three platforms: HMS Web, HMS Mobile, Guest App + Marketplace.
- Web screens inside an Apple Studio Display 27" frame; phone screens inside an iPhone 16 Pro Max frame.
- Leave places for custom GIFs.
- Built in React (not Figma).
- Reference for motion, buttons, price table and design sense: zatiqeasy.com.
- Site language: English (বাংলা toggle kept).
- Theme: light preset **BinGi Pearl** chosen (9 Nov 2026); no dark mode on the site. Motion, glow and shadow should give a SaaS feel.

## Sitemap — 8 screens

```
technology.bingi.com.bd
├─ /                Home (one scroll)
│   Hero (Studio Display + iPhone) → Problem (4) → One booking chain (+ GIF)
│   → 3 platforms → Property-type tabs → Plan teaser → FAQ (5) → CTA
├─ /products        tabs: Web · Mobile · Guest App · All modules (status chips)
│   Web tab also shows 4 GIF feature cards
├─ /pricing         cycle toggle (monthly · 6 mo −10% · yearly −25%)
│   rooms calculator (min 10) · 4 plan cards (per-room rate + total) · current offers · compare table (collapsed) · FAQ
├─ /help            search · 8 categories · articles · 1-min videos · What's new · contact
├─ /help/:slug      article template
├─ /contact         about + phone/WhatsApp/address + demo form
├─ /legal/:doc      privacy · terms · refund
└─ *                404
```

Header: Products · Pricing · Help · Contact · বাংলা/EN · Sign in · Get started.
Old URLs redirect: `/ecosystem`, `/connected` → `/products`; `/start` → `/pricing`; `/training` → `/help`.
(Server must also 301 these for SEO — see 03-technology.)

## Visitor flow

```
Ad / Google / Facebook
  ↓
Home → Products or Pricing
  ↓
Get started → hms.bingi.app/register (onboarding)
Side paths: Book a demo → WhatsApp (later: lead API → NEC TEAM)
            Help center (same articles as in-app "? Help", later)
```

## Truth rules
- Prices come from ONE catalog (`data/pricing.ts`) = onboarding v4 pricing (per room). Never type a price into a page.
- Every module carries a status chip from ONE registry (`data/status.ts`): Live / Coming Soon / Status to confirm.
- OTA, BinGi Payments, Developer API, BinGi AI = **Coming Soon** until verified live.
- No invented customer logos, testimonials or usage numbers. Add them only when real and approved.
- Offers say "now ৳0", never "free forever".

## Open decisions
| # | Decision | Current setting in the site |
|---|---|---|
| 1 | ~~Final pricing~~ **DECIDED 9 Nov 2026:** v4 per-room — Starter ৳30 · Business ৳50 · Ultra ৳116 per room/month, min billing 10 rooms, 6 mo −10%, 12 mo −25% | live on site |
| 2 | HMS Plan List still shows old room packages (৳500 / ৳1,999 / ৳3,500) — HMS must be updated to match | dev task |
| 3 | Plan features follow v4 entitlements (Business = housekeeping, restaurant, QR, expenses, services; Ultra = + full HRM, inventory, advanced ops, unlimited themes). Bar scope and menu limits still open → not shown | v4 matrix |
| 3b | "Min 10" = minimum *billing* (fewer real rooms allowed) — v4 marks this interpretation as recommended, not yet locked | FAQ says "billing starts at 10 rooms" |
| 4 | Free trial — length and whether to advertise | not mentioned; CTA = "Get started" |
| 5 | HMS Mobile + Guest App store status | "Status to confirm" chip |
| 6 | Official logo | PNG in place (SVG wanted) |
| 7 | Real screenshots / GIFs | labelled placeholders (see 02-ui-ux) |
| 8 | Legal text | placeholder until lawyer review |
| 9 | Demo form backend (lead API → NEC TEAM) | "Send on WhatsApp" button with the request filled in |
