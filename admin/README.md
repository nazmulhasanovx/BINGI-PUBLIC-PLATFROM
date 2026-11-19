# admin/ — BinGi site admin (React)

Change the public site's content, SEO and media, see leads and visitors, publish. Talks only to `api/`.
Plan and module list: [../docs/05-admin/PLAN.md](../docs/05-admin/PLAN.md)

```bash
cp .env.example .env     # VITE_API_URL, VITE_SITE_URL
npm install
npm run dev              # http://localhost:5174
npm run build            # type check + dist/
npm test                 # vitest (registry ↔ modules, form fields)
python3 e2e/flow.py      # browser check against a running API (needs OWNER_PASSWORD)
```

| File | What |
|---|---|
| `src/lib/modules.ts` | **The sidebar.** Group → module (M02–M22) → route → content types it edits → roles |
| `src/lib/registry.ts` | Types of `packages/content/types.json` (imported at build time) |
| `src/components/form/FieldInput.tsx` | One renderer per field type. Bilingual labels in `fieldLabels` |
| `src/pages/ContentModule.tsx` | Generic editor: one tab per content type, list + drawer for collections, form for singles |
| `src/pages/*` | Dashboard, Leads, Visitors, SEO, Publish, System (users, audit, media, account), Login |
| `src/components/ui.tsx` | Buttons, fields, drawer, confirm, toast, skeleton, empty, error — use these, not new ones |
| `src/lib/api.ts` | fetch wrapper; errors are `ApiError { code, message, fields }` |

Adding a content type needs **no admin code**: add it in `packages/content/gen-types.py`, then list it under a module in `src/lib/modules.ts`.
Every screen has loading (skeleton), empty and error states; every string is `{ bn, en }`.
