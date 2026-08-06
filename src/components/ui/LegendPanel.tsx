import { useEffect, useRef } from 'react'
import { useAuroraStore } from '../../store/auroraStore'

/** Top-right dismissible legend / info — keyboard navigable. */
export function LegendPanel() {
  const open = useAuroraStore((s) => s.legendOpen)
  const setLegendOpen = useAuroraStore((s) => s.setLegendOpen)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setLegendOpen(true)}
        className="rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--instrument-white)]/70 backdrop-blur-md transition hover:text-[var(--instrument-white)]"
        aria-expanded={false}
        aria-controls="legend-panel"
      >
        Info
      </button>
    )
  }

  return (
    <aside
      id="legend-panel"
      role="region"
      aria-label="About this instrument"
      className="w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] p-3.5 text-[var(--instrument-white)] shadow-xl backdrop-blur-md"
      data-selectable
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--instrument-white)]/55">
          Aurora Synthesizer
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={() => setLegendOpen(false)}
          className="rounded px-1.5 py-0.5 text-xs text-[var(--instrument-white)]/50 hover:text-[var(--instrument-white)]"
          aria-label="Close legend"
        >
          ✕
        </button>
      </div>
      <p className="text-[12px] leading-relaxed text-[var(--instrument-white)]/80">
        A live readout of Earth&apos;s aurora driven by NOAA satellites. What you
        see is what was measured minutes ago — not decorative space art.
      </p>
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--instrument-white)]/55">
        <span className="text-[var(--aurora-green)]">Green</span> — oxygen, quieter
        altitudes. <span className="text-[var(--aurora-magenta)]">Magenta</span> —
        nitrogen, higher energy (often when Bz turns south).
      </p>
      <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[var(--instrument-white)]/40">
        trace the current
      </p>
      <p className="mt-1 text-[11px] text-[var(--instrument-white)]/50">
        Drag through the field to locally perturb the real flow — like a
        bioluminescent tide pool that is actually there.
      </p>
      <p className="mt-3 text-[10px] text-[var(--instrument-white)]/35">
        Data: NOAA SWPC · no API key · public CORS
      </p>
    </aside>
  )
}
