# Space weather data

## Principles

- Use only **public, keyless, CORS-open** NOAA SWPC products for MVP.
- Document every fetch site with:

  ```ts
  // NOAA SWPC endpoints are public, keyless, and CORS-open. No auth required for MVP.
  ```

- Poll with TanStack Query `staleTime` / `refetchInterval` of **2–5 minutes** (this project uses **3 minutes**).
- Partial failures should degrade gracefully (keep last good values / safe defaults), not blank the instrument.

## Endpoints in use

| Key | URL | Fields used |
|-----|-----|-------------|
| Kp | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | Latest `Kp` |
| Bz | `https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json` | `bz_gsm` |
| Speed | `https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json` | `proton_speed` |
| Density | `https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json` | `proton_density` |
| OVATION | `https://services.swpc.noaa.gov/json/ovation_aurora_latest.json` | Max probability from `coordinates[][2]` |

Implementation: [`src/api/noaa.ts`](../src/api/noaa.ts).

## Format notes (2026)

- **K-index** product is an array of **objects** (`{ time_tag, Kp, ... }`), not only legacy string tables. The parser supports both.
- Legacy paths commonly cited in older tutorials:

  - `.../products/solar-wind/mag-1-day.json`
  - `.../products/solar-wind/plasma-1-day.json`

  currently return **404**. Prefer **summary** + **RTSW** feeds.

## How data maps to visuals

| Input | Visual / UX effect |
|-------|--------------------|
| **Kp** (0–9) | Ribbon height, equatorward band push, overall intensity, bloom strength |
| **Bz** (nT) | Negative (southward) increases energy → more magenta/red nitrogen mix |
| **Solar wind speed** | Flow speed (`timeScale` × wind factor); optional audio amplitude |
| **Density** | HUD readout (instrument completeness) |
| **OVATION max** | Stored for future use / diagnostics; Kp remains primary band driver |
| **Pointer UV + strength** | Local curl offset only; decays after leave |

Derived labels:

- `activityLabelFromKp` — Quiet → Severe storm
- `latitudeFromKp` — rough equatorward edge heuristic for HUD copy

## Rate limiting & ethics

NOAA SWPC provides free public data for the community. Treat it as a shared resource:

- Do not add aggressive auto-refresh loops
- Do not scrape high-frequency endpoints from many concurrent clients without need
- Prefer caching (TanStack Query already does)

## Attribution

Display or docs should credit **NOAA / NWS Space Weather Prediction Center**. This app is not an official NOAA product.

## Future keyed APIs

If adding NASA DONKI or similar:

1. Add a minimal serverless proxy (Vercel / Cloudflare Function).
2. Store keys only in server env (`.env.local` locally; platform secrets in prod).
3. Never prefix secrets with `VITE_`.
4. Update `.env.example` with **names only**, never values.
