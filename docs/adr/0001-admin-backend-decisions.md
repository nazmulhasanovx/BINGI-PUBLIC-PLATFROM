# ADR 0001 — Admin panel & backend: the six open decisions (D1–D6)

Date: 19 Nov 2026 · Status: **Accepted** (Nazmul: "start the work, no need to ask")
Plan: `docs/05-admin/PLAN.md` (copy of the Claude Doc "Admin Panel & Backend Plan v1")

| # | Decision | Chosen | Why | Revisit when |
|---|---|---|---|---|
| D1 | Backend stack | **Laravel 12 + MySQL 8** (SQLite for local tests) | Same stack as BinGi Business OS; HMS API behaves like Laravel; the team already knows it | never for v1 |
| D2 | Hosting | Site stays static (any host). API + MySQL on one small VPS (PHP 8.3, Nginx). Site build runs in GitHub Actions after Publish | Static site keeps Lighthouse 96–99 and survives API downtime | when the production host is known — see `docs/05-admin/DEPLOY.md` |
| D3 | Pricing source | Edited in the admin for v1. Marked **temporary**: when Super Admin exposes its pricing API, the admin reads it and the editor becomes read-only | Audit P0 #4: one pricing source across HMS / Super Admin / website | Super Admin pricing API exists |
| D4 | Admin address & login | `admin.technology.bingi.com.bd`, own email + password login (Sanctum tokens) | Super Admin is mid-redesign; SSO can be added later without changing the API | Super Admin SSO ready |
| D5 | Lead → NEC TEAM | Leads live in the admin. An outgoing webhook setting (`LEAD_WEBHOOK_URL`) is built but off | NEC TEAM API not reviewed yet | NEC TEAM API ready |
| D6 | Analytics | Own cookie-less events (no personal data, daily-salted hash). GA4 / Meta Pixel IDs are optional settings; setting one turns on a consent banner | No cookie banner needed by default; ads can still use Pixel | ads start |
