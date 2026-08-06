# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial public release scaffolding: docs, license, CI, contribution guides.

## [0.1.0] — 2026-08-07

### Added

- Full-bleed WebGL aurora instrument (Vite + React + TypeScript + R3F).
- Custom GLSL domain-warped simplex + curl noise ribbons (no particle systems).
- Live NOAA SWPC polling via TanStack Query (Kp, Bz, solar wind, density, OVATION).
- Zustand store for weather, interaction, polling status, reduced-motion, FPS degradation.
- Pointer + touch local field perturbation with ~1.5 s decay.
- Instrument HUD: calibration sequence, Kp readout, legend, LIVE status, mobile chip.
- Screen-reader live region; WebGL / performance fallback UI.
- Bloom via pmndrs `postprocessing`.
- Optional restrained Web Audio drone (Bz pitch, wind amplitude).
- `prefers-reduced-motion` handling and FPS watchdog with noise-octave fallback.

### Notes

- NOAA legacy `solar-wind/*-1-day.json` paths 404 as of 2026; summary + RTSW endpoints used instead.
- MVP requires **zero** API keys.

[Unreleased]: https://github.com/OWNER/aurora-synthesizer/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/OWNER/aurora-synthesizer/releases/tag/v0.1.0
