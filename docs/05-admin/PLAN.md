# Admin panel & backend — plan v1 (19 Nov 2026)

Live doc: https://claude.ai/artifact/4g9RjLNNmhaW8EKEUR9xps · decisions: [ADR 0001](../adr/0001-admin-backend-decisions.md)

## Goal
A small admin where the team changes the public site's content, SEO and sees leads and visitors — without touching code.
Layout and design stay in code; the admin changes content only.

## Modules (22) · screens (34)
| # | Module | Group | Screens | Role |
|---|---|---|---|---|
| M01 | Login / reset | — | 2 | all |
| M02 | Dashboard | Daily | 1 | all |
> Access column = default roles only. Since 21 Nov 2026 any role can be built from any modules (view / edit) in Users & roles.

| M03 | Leads | Daily | 2 | Owner, Sales |
| M04 | Visitors (analytics) | Growth | 2 | Owner, Sales |
| M05 | SEO (pages, sitemap, robots, redirects, verification) | Growth | 2 | Owner, Editor |
| M06 | Pages & sections | Content | 2 | Owner, Editor |
| M07 | Navigation & footer | Content | 1 | Owner |
| M08 | Site settings | Content | 1 | Owner |
| M09 | Status registry | Content | 1 | Owner |
| M10 | Pricing | Content | 1 | Owner |
| M11 | Themes | Content | 2 | Owner, Editor |
| M12 | Team | Content | 2 | Owner, Editor |
| M13 | Testimonials & logos | Content | 2 | Owner, Editor |
| M14 | Blog | Content | 2 | Owner, Editor |
| M15 | Help & Docs | Content | 2 | Owner, Editor |
| M16 | FAQ | Content | 1 | Owner, Editor |
| M17 | Changelog | Content | 1 | Owner, Editor |
| M18 | Careers | Content | 2 | Owner, Editor |
| M19 | Media library | Content | 1 | Owner, Editor |
| M20 | Publish & history | System | 1 | Owner |
| M21 | Users & roles | System | 2 | Owner |
| M22 | Audit log | System | 1 | Owner |

Roles: **owner** (everything, publish, users) · **editor** (content + SEO, no publish) · **sales** (leads, visitors).

## Flow
Admin → API (draft) → Owner presses Publish → versioned `content.json` snapshot → site build (GitHub Action) → static deploy.
Rollback = publish an older snapshot. The site only calls the API at runtime for two things: lead form, visitor events.

## Steps
A00 decisions · A01 repo + CI · A02 content schema + seed ·
A03 API auth/roles/audit · A04 entries · A05 media · A06 leads · A07 events · A08 SEO · A09 publish (Gate 1) ·
A10 admin shell · A11 dashboard + leads · A12 settings/status/pricing/nav · A13 pages · A14 themes/team/testimonials/media ·
A15 blog/help/FAQ/changelog/careers · A16 SEO UI · A17 visitors · A18 publish/users/audit (Gate 2) ·
A19 site reads snapshot + beacon + lead API · A20 QA + staging (Gate 3) · A21 release.

## Truth guardrails (enforced by the API)
- Status `live` needs `verified_by` + `verified_at`. BinGi AI can only be `beta` or `soon`.
- Testimonials and client logos need a permission file before they can be visible.
- Counters need a `source`.
- Pricing publish shows old → new diff.
- Visitor numbers come only from recorded events.
- Lead phone numbers only for owner + sales; exports are audited.
