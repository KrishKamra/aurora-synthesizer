import { useEffect, useState } from 'react'
import { useAuroraStore } from '../../store/auroraStore'
import { TickNumber } from './TickNumber'

/**
 * 1–2 s calibration sequence: numbers count up from 0 to field values
 * (instrument powering on).
 */
export function CalibrationOverlay() {
  const kp = useAuroraStore((s) => s.field.kp)
  const calibrated = useAuroraStore((s) => s.calibrated)
  const setCalibrated = useAuroraStore((s) => s.setCalibrated)
  const [phase, setPhase] = useState<'boot' | 'done'>('boot')

  useEffect(() => {
    if (calibrated) return
    const t = window.setTimeout(() => {
      setPhase('done')
      window.setTimeout(() => setCalibrated(true), 400)
    }, 1600)
    return () => clearTimeout(t)
  }, [calibrated, setCalibrated])

  if (calibrated) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-500"
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(5,6,8,0.55) 0%, rgba(5,6,8,0.92) 70%)',
        opacity: phase === 'done' ? 0 : 1,
      }}
      aria-hidden={phase === 'done'}
    >
      <div className="text-center" data-selectable>
        <p className="mb-3 text-[10px] uppercase tracking-[0.35em] text-[var(--instrument-white)]/50">
          Instrument calibration
        </p>
        <div className="font-mono text-5xl font-semibold tracking-tight text-[var(--aurora-green)] sm:text-6xl">
          <TickNumber value={kp} decimals={1} durationMs={1400} />
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--instrument-white)]/60">
          Kp · powering on
        </p>
        <div className="mx-auto mt-6 h-px w-32 bg-gradient-to-r from-transparent via-[var(--aurora-green)]/50 to-transparent" />
        <p className="mt-4 text-[11px] tracking-wide text-[var(--instrument-white)]/40">
          NOAA SWPC · live field
        </p>
      </div>
    </div>
  )
}
