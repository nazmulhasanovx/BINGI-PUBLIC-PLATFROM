# Content types (generated from packages/content/types.json — edit gen-types.py, then run it)

Field types: `string` one line · `text` multi-line · `l` bilingual line {bn,en} · `lt` bilingual multi-line · `number` · `bool` · `enum` (fixed options) · `url` · `image` (media library path) · `date` YYYY-MM-DD · `llist` list of `l` · `strlist` list of strings · `list` list of objects · `object` · `blocks` blog body (heading / paragraph / list) · `json` raw JSON.

`internal` fields stay in the admin and are never published. Guards: `verified_live` (Live needs verified_by + verified_at) · `ai_not_live` (BinGi AI cannot be Live) · `permission` (visible needs permission_file) · `source` (needs a source).

| Type | Kind | Snapshot key | Module | Name | Guards |
|---|---|---|---|---|---|
| `site` | single | `site` | M08 | Site settings | — |
| `nav_item` | collection | `nav` | M07 | Header menu | — |
| `footer_column` | collection | `footer` | M07 | Footer columns | — |
| `page_copy` | collection | `copy` | M06 | Page copy | — |
| `hidden_section` | collection | `hiddenSections` | M06 | Hidden sections | — |
| `trust_fact` | collection | `trustFacts` | M06 | Trust facts | source |
| `module` | collection | `modules` | M09 | Module status | verified_live, ai_not_live |
| `platform_status` | single | `platformStatus` | M09 | Platform status | verified_live_single |
| `integration` | collection | `integrations` | M09 | Payments & hardware | verified_live |
| `pricing_config` | single | `pricingConfig` | M10 | Pricing rules | — |
| `plan` | collection | `plans` | M10 | Plans | — |
| `property_type` | collection | `propertyTypes` | M10 | Property types | — |
| `compare_group` | collection | `compare` | M10 | Feature comparison | — |
| `theme` | collection | `themes` | M11 | Plan themes | — |
| `store_theme` | collection | `storeThemes` | M11 | Theme store | — |
| `team_member` | collection | `team` | M12 | Team | — |
| `testimonial` | collection | `testimonials` | M13 | Testimonials | permission |
| `client_logo` | collection | `clientLogos` | M13 | Client logos | permission |
| `blog_post` | collection | `posts` | M14 | Blog | — |
| `help_category` | collection | `categories` | M15 | Help categories | — |
| `help_article` | collection | `articles` | M15 | Help articles | — |
| `whats_new` | collection | `whatsNew` | M15 | What's new (help) | — |
| `doc_page` | collection | `docs` | M15 | Docs pages | — |
| `faq` | collection | `faqs` | M16 | FAQ | — |
| `changelog` | collection | `changes` | M17 | Changelog | — |
| `career_team` | collection | `roles` | M18 | Careers | — |
| `solution` | collection | `solutions` | M06 | Solution pages | — |

## `site` — Site settings

| Field | Type | Required | Notes |
|---|---|---|---|
| `company` | string | yes |  |
| `parent` | string | yes |  |
| `phone` | string | yes |  |
| `phoneIntl` | string | yes |  |
| `whatsapp` | url | yes |  |
| `address` | l | yes |  |
| `hmsLogin` | url | yes |  |
| `hmsRegister` | url | yes |  |
| `marketplace` | url | yes |  |
| `facebook` | url |  |  |
| `youtube` | url |  |  |
| `announcement` | l |  | Announcement bar (empty = hidden) |
| `gaId` | string |  | GA4 ID (turns on the consent banner) |
| `pixelId` | string |  | Meta Pixel ID (turns on the consent banner) |

## `nav_item` — Header menu

| Field | Type | Required | Notes |
|---|---|---|---|
| `to` | string | yes | Path (/pricing) or full URL |
| `label` | l | yes |  |
| `phoneOnly` | bool |  |  |

## `footer_column` — Footer columns

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | l | yes |  |
| `links` | list | yes | fields: to, label, kind, badge |

## `page_copy` — Page copy

| Field | Type | Required | Notes |
|---|---|---|---|
| `key` | enum | yes | options: home.hero.line1, home.hero.line2, home.hero.mark, home.hero.lead, home.hero.cta, home.story.title, home.bento.title, home.platforms.title, home.types.title, home.faq.title, home.team.title |
| `value` | lt | yes |  |

## `hidden_section` — Hidden sections

| Field | Type | Required | Notes |
|---|---|---|---|
| `key` | enum | yes | options: home.trust, home.story, home.bento, home.platforms, home.themes-ai, home.types, home.integrations, home.pricing, home.testimonials, home.faq, home.team |

## `trust_fact` — Trust facts

| Field | Type | Required | Notes |
|---|---|---|---|
| `value` | l | yes | {liveModules} = number of live modules |
| `label` | l | yes |  |
| `source` | string | yes | Where this fact comes from |

## `module` — Module status

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `status` | enum | yes | options: live, beta, soon, confirm |
| `icon` | string | yes | lucide icon name |
| `name` | l | yes |  |
| `desc` | l | yes |  |
| `verified_by` | string |  | internal · Who verified it (required for Live) |
| `verified_at` | date |  | internal · When verified |

## `platform_status` — Platform status

| Field | Type | Required | Notes |
|---|---|---|---|
| `web` | enum | yes | options: live, beta, soon, confirm |
| `mobile` | enum | yes | options: live, beta, soon, confirm |
| `guest` | enum | yes | options: live, beta, soon, confirm |
| `verified_by` | string |  | internal · Who verified it (required for Live) |
| `verified_at` | date |  | internal · When verified |

## `integration` — Payments & hardware

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `kind` | enum | yes | options: pay, hw |
| `status` | enum | yes | options: live, beta, soon, confirm |
| `name` | l | yes |  |
| `verified_by` | string |  | internal · Who verified it (required for Live) |
| `verified_at` | date |  | internal · When verified |

## `pricing_config` — Pricing rules

| Field | Type | Required | Notes |
|---|---|---|---|
| `minBillable` | number | yes |  |
| `launchOff` | number | yes |  |
| `launchUntil` | l | yes |  |
| `themePrice` | number | yes |  |
| `cycles` | list | yes | fields: id, months, discount, label |
| `cycleRates` | json | yes | Monthly rate → rate per cycle |
| `offers` | llist |  |  |

## `plan` — Plans

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | enum | yes | options: starter, business, ultra, custom |
| `name` | string | yes |  |
| `rate` | number |  | ৳ per room/month (empty = quotation) |
| `regular` | number |  |  |
| `activation` | json |  |  |
| `fees` | json |  |  |
| `popular` | bool |  |  |
| `tagline` | l | yes |  |
| `plus` | l |  |  |

## `property_type` — Property types

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | enum | yes | options: home, guest, hotel, resort, group |
| `name` | l | yes |  |
| `plan` | enum | yes | options: starter, business, ultra, custom |
| `need` | l | yes |  |

## `compare_group` — Feature comparison

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | l | yes |  |
| `rows` | json | yes |  |

## `theme` — Plan themes

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `plan` | enum | yes | options: starter, business, ultra |
| `for` | l | yes |  |
| `demo` | string | yes | Demo hotel slug |

## `store_theme` — Theme store

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `name` | string | yes |  |
| `collection` | enum | yes | options: luxury, signature, more |
| `for` | l | yes |  |
| `demo` | string | yes |  |

## `team_member` — Team

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes |  |
| `role` | l | yes |  |
| `group` | l | yes |  |
| `photo` | image |  |  |
| `linkedin` | url |  | The person's own public profile |

## `testimonial` — Testimonials

| Field | Type | Required | Notes |
|---|---|---|---|
| `quote` | lt | yes |  |
| `name` | string | yes |  |
| `role` | l | yes |  |
| `property` | string | yes |  |
| `photo` | image |  |  |
| `permission_file` | image |  | internal · Written permission (required to show it) |

## `client_logo` — Client logos

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes |  |
| `src` | image | yes |  |
| `permission_file` | image |  | internal · Written permission (required to show it) |

## `blog_post` — Blog

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes |  |
| `date` | date | yes |  |
| `tag` | l | yes |  |
| `title` | l | yes |  |
| `summary` | lt | yes |  |
| `cover` | object | yes | fields: src, alt |
| `body` | blocks | yes |  |

## `help_category` — Help categories

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes |  |
| `icon` | string | yes |  |
| `name` | l | yes |  |

## `help_article` — Help articles

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes |  |
| `category` | string | yes |  |
| `title` | l | yes |  |
| `summary` | lt | yes |  |
| `steps` | llist | yes |  |
| `draft` | bool |  |  |

## `whats_new` — What's new (help)

| Field | Type | Required | Notes |
|---|---|---|---|
| `date` | l | yes |  |
| `title` | l | yes |  |

## `doc_page` — Docs pages

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes |  |
| `group` | enum | yes | options: Start here, Platform, Modules, Account, Help |
| `title` | string | yes |  |
| `summary` | text | yes |  |
| `where` | string |  |  |
| `plan` | string |  |  |
| `status` | enum |  | options: Live, Beta, Coming soon, Rolling out |
| `sections` | json | yes |  |
| `fixes` | json |  |  |

## `faq` — FAQ

| Field | Type | Required | Notes |
|---|---|---|---|
| `page` | enum | yes | options: home, pricing, marketplace |
| `q` | l | yes |  |
| `a` | lt | yes |  |

## `changelog` — Changelog

| Field | Type | Required | Notes |
|---|---|---|---|
| `month` | l | yes |  |
| `status` | enum | yes | options: live, testing, soon |
| `title` | l | yes |  |
| `items` | llist | yes |  |

## `career_team` — Careers

| Field | Type | Required | Notes |
|---|---|---|---|
| `team` | l | yes |  |
| `titles` | llist | yes |  |

## `solution` — Solution pages

| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | yes |  |
| `type` | enum | yes | options: home, guest, hotel, resort, group |
| `title` | l | yes |  |
| `intro` | lt | yes |  |
| `runs` | llist | yes |  |
| `modules` | strlist | yes |  |
| `themes` | strlist | yes |  |
