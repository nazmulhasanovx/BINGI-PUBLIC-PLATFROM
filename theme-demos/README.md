# Theme demos (real theme code)

The hotel website themes from `nazmulhasanovx/BINGI-WEB-theme-` (copied into `app-src/`, demo photos downscaled to 1600 px, kept once in `website/public/theme-demo/demo/`)
built as a static demo for the public site. Each theme card on /themes opens `theme-demo/index.html#/hotel/<demo-slug>`.

```bash
cd theme-demos && npm i && npm run build   # → ../website/public/theme-demo/
```
Only the hotel website routes are included (no HMS, no onboarding). Demo hotels are fictional; nothing is really booked.
To update: copy the theme repo's `src/` over `app-src/` again and rebuild.
