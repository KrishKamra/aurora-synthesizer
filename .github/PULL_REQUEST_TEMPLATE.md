## Summary

<!-- What changed and why (1–3 sentences). -->

## Type of change

- [ ] Bug fix
- [ ] New feature
- [ ] Performance
- [ ] Documentation
- [ ] Refactor / chore
- [ ] Breaking change

## Design constraints checklist

Confirm this PR still respects the product rules (or explicitly proposes changing them):

- [ ] Shader remains the visual source of truth (no DOM-drawn aurora)
- [ ] No particle libraries for aurora ribbons
- [ ] Interaction only locally perturbs the real field
- [ ] No client-side API keys / `VITE_*` secrets
- [ ] NOAA polling stays ≥ 2–5 minutes
- [ ] A11y: data still available without canvas where relevant

## How tested

- [ ] `pnpm lint`
- [ ] `pnpm build`
- [ ] Manual check in browser (note which): _______________
- [ ] Mobile / narrow viewport (if UI change)
- [ ] `prefers-reduced-motion` (if motion change)
- [ ] Screenshots / clip attached for visual changes

## Screenshots

<!-- Drag images here for UI/shader changes. -->

## Related issues

<!-- Closes #123 -->
