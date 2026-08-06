# Architecture

## Thesis

Aurora Synthesizer is a **client-only scientific instrument**: one full-bleed WebGL canvas, restrained HUD chrome, and uniforms driven by live NOAA data. Interaction never replaces the data field — it only adds a temporary local perturbation.

## Design rules

1. **Shader is the single source of visual truth.** React computes uniforms and UI; it never paints aurora pixels in the DOM.
2. **Custom GLSL flow field** — domain-warped simplex + curl noise. No particle systems for ribbons.
3. **Honest data** — resting state = latest successful NOAA snapshot (or safe defaults before first fetch).
4. **60 fps preference** — degrade DPR and noise octaves before accepting dropped frames.
5. **No backend / no secrets for MVP.**

## Runtime data flow

```
NOAA SWPC (HTTPS JSON)
        │
        ▼
 TanStack Query  ──refetch ~3 min──►  fetchSpaceWeather()
        │
        ▼
   Zustand store  (weather, pollingStatus, interaction, flags)
        │
        ├──────────────► AuroraPlane uniforms (each frame)
        ├──────────────► Instrument HUD / LiveRegion
        └──────────────► optional Web Audio drone
```

## Module map

| Path | Responsibility |
|------|----------------|
| `src/main.tsx` | React root, QueryClient defaults |
| `src/App.tsx` | Shell: WebGL gate, error boundary, hooks |
| `src/api/noaa.ts` | Parallel NOAA fetches + parsing |
| `src/api/types.ts` | `SpaceWeatherSnapshot`, activity labels |
| `src/store/auroraStore.ts` | Global UI + science + interaction state |
| `src/shaders/auroraShaders.ts` | Vertex/fragment GLSL |
| `src/components/scene/AuroraScene.tsx` | Canvas, DPR, FPS watchdog |
| `src/components/scene/AuroraPlane.tsx` | Full-viewport plane + uniform updates |
| `src/components/scene/Stars.tsx` | Sparse dim points (under bloom threshold) |
| `src/components/scene/PostFX.tsx` | Bloom composer |
| `src/hooks/useInteraction.ts` | Pointer/touch UV + 1.5s decay (skips HUD targets) |
| `src/hooks/useSpaceWeather.ts` | Query → store bridge |
| `src/components/ui/*` | Calibration, readout, legend, fallback, a11y |

## Rendering stack

- **Orthographic** camera — flat instrument framing, not a free-flight 3D tour.
- **Stars** rendered first (behind); **aurora** additive transparent plane on top.
- **Bloom** threshold high enough that stars stay pinpoints; ribbon cores glow.
- **Tone mapping:** disabled (`NoToneMapping`) so HDR cores and bloom control glow.

## Interaction model

- UV origin matches GLSL (`y` up).
- Strength ramps to 1 while active; decays ~1.5 s after leave/up.
- Multi-touch secondary contacts ignored.
- Events on `button`, `a`, `[data-selectable]`, etc. are ignored so HUD remains clickable.

## Performance & fallback

| Signal | Response |
|--------|----------|
| Sustained FPS &lt; ~28 | `fpsDegraded` → fewer noise octaves, lower bloom cost, lower DPR |
| No WebGL | `webglFailed` → static `Fallback` instrument |
| Shader/runtime throw | `ErrorBoundary` → same fallback |
| `prefers-reduced-motion` | Cap flow speed; disable interaction turbulence |

## Styling

- Tailwind for HUD layout only.
- CSS custom properties (`--void`, `--aurora-green`, …) are the palette source of truth; shader colors are read once via `getComputedStyle` / hex parse.

## What not to add casually

- Next.js / SSR (adds complexity without benefit for a pure client WebGL instrument)
- Particle libraries for the aurora
- Client-side API keys
- Aggressive NOAA polling (&lt; 2 minutes)
- Heavy UI chrome that steals full-bleed framing
