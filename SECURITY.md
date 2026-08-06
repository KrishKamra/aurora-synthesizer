# Security policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main` (latest) | Yes |
| Published releases | Yes (latest minor) |
| Older tags | Best effort only |

This project is a **static client application** with **no backend and no required secrets** for the MVP. Risk surface is primarily supply-chain (dependencies) and future misuse of client-side env vars.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Email the maintainers at:

**krishkamra@gmail.com**

Include:

- A clear description of the issue and impact
- Steps to reproduce or a proof of concept (if safe to share)
- Affected commit / version / deploy URL if known
- Any suggested fix

You can expect:

- Acknowledgement within **72 hours** when possible
- An initial assessment and timeline update within **7 days**
- Credit in the changelog if you wish (optional)

We will not take legal action against good-faith research that follows responsible disclosure.

## Hard rules for this codebase

1. **No API keys in the client.** Never commit secrets. Never put secrets in `VITE_*` variables (they are embedded in the browser bundle).
2. **`.env*` is gitignored** except `.env.example`. Confirm before any “first commit” that adds env usage.
3. **Future keyed APIs** (e.g. NASA DONKI) must be proxied through a serverless function or other backend; keys live only in server env.
4. **Dependencies:** prefer `pnpm` lockfile commits; review major upgrades carefully.
5. **NOAA polling:** do not ship changes that hammer public SWPC endpoints (keep ≥ 2–5 minute intervals).

## Scope notes

Out of scope for “security vulnerability” reports unless they cause real user harm:

- Cosmetic UI issues
- Performance on low-end GPUs (file as bugs/enhancements)
- NOAA upstream outages or data quality

In scope examples:

- XSS via unsafe HTML injection in HUD/live region
- Dependency with known critical CVE used in production path
- Accidental exposure of secrets in repo history or build artifacts

Thank you for helping keep users safe.
