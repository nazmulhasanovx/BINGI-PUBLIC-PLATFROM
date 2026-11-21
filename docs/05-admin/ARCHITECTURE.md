# Architecture

```
 Admin panel (admin/, React)  ──save draft──▶  Site API (api/, Laravel 12)  ──▶  MySQL + media (storage/app/public)
                                                     │
                                            Publish (roles with M20 edit)
                                                     ▼
                     content.json snapshot (versioned, storage/app/public/content/v{n}.json + latest.json)
                                                     │ repository_dispatch (BUILD_HOOK_URL)
                                                     ▼
                     GitHub Action: website build ── fetches /public/content ── prerender ──▶ static deploy
                                                     │
 Public site (website/) ──lead form + visitor events──▶ /api/v1/public/*   (the only runtime calls)
```

## Why it is built this way
- **The site never waits on the API.** Content is baked in at build time. If the API is down, the site keeps the last build; if a build cannot reach the API, every data file falls back to the value written in code (`pick(key, fallback)`).
- **One shape definition.** `packages/content/gen-types.py` → `types.json`. The API validates with it, the admin draws forms from it, the snapshot uses its `key`s, and the website's `src/data/*.ts` read those keys.
- **Draft → Publish.** Every entry has `data` (working copy) and `published_data` (live copy). `state` = draft / changed / published. Publish copies one to the other for all entries at once, stores a numbered snapshot, and hard-deletes trashed entries. Rollback republishes an old snapshot as a new version.
- **Truth guards in the API**, not in the UI, so no client can skip them.
- **Visitors without cookies.** Each event stores `sha256(salt + date + IP + user agent)` cut to 16 characters — never the IP. The hash changes every day, so "visitors" means unique visitors per day. Raw events are kept 90 days; `daily_stats` keeps the totals forever.

## Website side
| File | Role |
|---|---|
| `website/src/data/content.ts` | loads `generated/content.json` if it exists; `pick(key, fallback)` |
| `website/scripts/fetch-content.mjs` | build step: `CONTENT_API` → `generated/content.json` (skipped when unset) |
| `website/src/data/copy.ts` | `copy(key, fallback)` text overrides + `shown(section)` |
| `website/src/lib/track.ts` | batches visitor events to `/public/events` |
| `website/src/components/site/Demo.tsx` | lead form → `/public/leads`, WhatsApp as fallback |
