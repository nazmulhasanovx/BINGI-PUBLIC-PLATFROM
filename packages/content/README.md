# packages/content — the one place content shape is defined

| File | What |
|---|---|
| `gen-types.py` | **Edit here.** Every content type, its fields and guards. Run `python3 gen-types.py`. |
| `types.json` | Generated registry. Read by the API (validation, snapshot) and the admin (forms). |
| `seed/*.json` | Today's site content, one file per type (`_seo.json` = SEO pages). The API seeds from it. |
| `export-seed.ts` | Rebuilds `seed/` from `website/src/data/*.ts`: `npm --prefix website run content:seed` |

Add a content type:
1. Add it to `gen-types.py`, run it (also regenerates `docs/05-admin/CONTENT_TYPES.md`).
2. In the website, read it with `pick('<snapshot key>', fallback)` in a `src/data/*.ts` file.
3. Add its seed value in `export-seed.ts`, run `content:seed`.
4. The admin shows a form for it automatically (it renders forms from `types.json`).
