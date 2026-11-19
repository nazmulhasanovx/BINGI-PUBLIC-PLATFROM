# Working in this repo

## Branches
| Branch | Meaning |
|---|---|
| `main` | What is live. Protected. Only release merges. |
| `develop` | Every finished step lands here. |
| `admin/Axx-short-name` | One plan step (A00–A21) = one branch = one PR into `develop`. PR title `Axx: what it does`. |
| `fix/short-name` | A bug fix, PR into `develop` (or `main` for a hotfix, then back-merge). |

## Before you open a PR
1. `cd api && composer test` (Pest) — if you touched `api/`
2. `cd admin && npm run build && npm test` — if you touched `admin/`
3. `cd website && npm run build` — if you touched `website/` or `packages/content/`
4. One line in `docs/04-qa/README.md`: date · step · what you checked.
5. A decision that changes behaviour → a new file in `docs/adr/`.

CI (`.github/workflows/ci.yml`) runs the same checks on every push and PR.

## Rules that never change
- Truth: never mark anything "Live" without who verified it and when (the API enforces it).
- No secrets in git. Copy `.env.example` → `.env`.
- Every UI string has Bangla + English.
- Content shape lives in ONE place: `packages/content/` (types + JSON Schema). API and site both read it.
