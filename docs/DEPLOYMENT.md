# Deployment

Aurora Synthesizer is a **static single-page app**. Build output is the `dist/` folder. No server runtime or environment secrets are required for the MVP.

## Build

```bash
pnpm install --frozen-lockfile
pnpm build
```

Artifacts:

- `dist/index.html`
- `dist/assets/*` (hashed JS/CSS)
- `dist/favicon.svg`

## Vercel

1. Import the GitHub repository.
2. **Framework preset:** Vite (or Other).
3. **Build command:** `pnpm build` (enable pnpm in project settings if needed).
4. **Output directory:** `dist`.
5. **Install command:** `pnpm install` (or leave default if Vercel detects pnpm via lockfile).

Optional `vercel.json` is not required for a basic SPA. If client-side routing is added later, add a rewrite of all routes to `/index.html`.

## Cloudflare Pages

1. Connect the repository.
2. **Build command:** `pnpm build`
3. **Build output directory:** `dist`
4. **Root directory:** `/` (repo root)
5. Set environment to use pnpm if the dashboard offers package-manager detection.

## Netlify

```toml
# netlify.toml (optional)
[build]
  command = "pnpm build"
  publish = "dist"
```

## SPA note

This app has a single route (`/`). No history-API fallback is required today.

## Caching

- HTML: short cache or revalidate on deploy
- Hashed assets under `/assets/`: long-lived immutable cache is fine

## CORS & NOAA

The browser calls NOAA SWPC **directly**. Deployments work only as long as those endpoints remain CORS-open. If that ever changes, introduce a same-origin proxy (serverless) — still without putting secrets in the client.

## Health checklist after deploy

- [ ] Canvas loads (or static fallback on unsupported devices)
- [ ] Network tab shows successful NOAA fetches (~200)
- [ ] Kp / LIVE status updates after first poll
- [ ] Drag interaction perturbs the field locally
- [ ] Mobile chip expands the instrument panel
- [ ] No `VITE_*` secrets present in built JS

## Custom domain

Point DNS per host docs. No special headers required for MVP. Optional hardening:

```
Content-Security-Policy: default-src 'self'; connect-src 'self' https://services.swpc.noaa.gov; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; worker-src 'self' blob:
```

Tune CSP carefully — WebGL + Google Fonts need the above allowances. Test thoroughly before enforcing in production.
