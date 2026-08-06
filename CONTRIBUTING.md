# Contributing to Aurora Synthesizer

Thanks for helping improve this instrument. The goal is a **honest, performant, accessible** live aurora readout — not decorative space wallpaper.

## Code of conduct

By participating, you agree to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development setup

1. **Fork** the repository and clone your fork.
2. Install [Node.js 20+](https://nodejs.org/) and [pnpm](https://pnpm.io/installation).
3. Install dependencies and start the dev server:

```bash
pnpm install
pnpm dev
```

4. Before opening a PR, ensure:

```bash
pnpm lint
pnpm build
```

## Branching & commits

- Create a feature branch from `main`: `git checkout -b feat/short-description`
- Prefer conventional-style commits when practical:
  - `feat:` new user-facing capability
  - `fix:` bug fix
  - `docs:` documentation only
  - `perf:` performance
  - `refactor:` no behavior change
  - `chore:` tooling, deps, CI
- Keep PRs focused. Prefer small, reviewable changes over mega-diffs.

## Design constraints (non-negotiable)

Please respect these product rules unless a PR explicitly proposes changing them (and documents why):

1. **Single full-bleed WebGL canvas** — UI is restrained HUD only.
2. **Custom GLSL flow field** (domain-warped simplex + curl). No particle libraries for the aurora.
3. **NOAA data drives uniforms** — interaction only **locally perturbs** the real field; it must not invent a second global climate.
4. **No API keys in the client** for MVP; any future secrets stay server-side.
5. **Poll NOAA no faster than every 2–5 minutes.**
6. **Accessibility:** live region and HUD must still convey Kp / conditions without the canvas.
7. **Performance:** prefer lower resolution / fewer noise octaves over dropped frames.

## Where to change things

| Concern | Location |
|---------|----------|
| Aurora look / noise / color | `src/shaders/auroraShaders.ts` |
| Uniform wiring | `src/components/scene/AuroraPlane.tsx` |
| NOAA fetch / parse | `src/api/noaa.ts`, `src/api/types.ts` |
| Global state | `src/store/auroraStore.ts` |
| Interaction decay | `src/hooks/useInteraction.ts` |
| HUD / a11y | `src/components/ui/*` |
| Bloom | `src/components/scene/PostFX.tsx` |

Deeper notes: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md), [docs/DATA.md](./docs/DATA.md).

## Pull requests

1. Open a PR against `main` using the template.
2. Describe **what** changed and **why**, plus how you verified (browser, device, reduced-motion, etc.).
3. Include screenshots or a short clip for visual changes.
4. Link related issues.
5. Ensure CI is green.

## Reporting bugs

Use the **Bug report** issue template. Include:

- Browser / OS
- Whether WebGL works (or fallback showed)
- Console errors
- Whether NOAA requests succeeded (Network tab)

## Feature ideas

Use the **Feature request** template. Prefer ideas that strengthen the instrument metaphor (honest data, performance, a11y) over pure spectacle.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
