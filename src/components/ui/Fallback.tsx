import { useAuroraStore } from '../../store/auroraStore'
import { TickNumber } from './TickNumber'

/**
 * Clean static fallback when WebGL fails or performance is unusable.
 * Still useful as an instrument: Kp + conditions summary.
 */
export function Fallback() {
  const weather = useAuroraStore((s) => s.weather)
  const lastError = useAuroraStore((s) => s.lastError)

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
      style={{ background: 'var(--void)' }}
      data-selectable
    >
      <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[var(--instrument-white)]/40">
        Aurora Synthesizer
      </p>
      <div className="font-mono text-7xl font-semibold text-[var(--aurora-green)]">
        <TickNumber value={weather.kp} decimals={1} />
      </div>
      <p className="mt-2 text-sm text-[var(--instrument-white)]/80">{weather.activityLabel}</p>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-[var(--instrument-white)]/55">
        Live visualization unavailable on this device. Current conditions still
        report from NOAA SWPC.
      </p>
      <dl className="mt-8 grid grid-cols-2 gap-x-10 gap-y-3 text-left text-xs">
        <div>
          <dt className="text-[var(--instrument-white)]/40">Bz</dt>
          <dd className="font-mono">{weather.bz.toFixed(1)} nT</dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Solar wind</dt>
          <dd className="font-mono">{Math.round(weather.solarWindSpeed)} km/s</dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Aurora edge</dt>
          <dd className="font-mono">≈ {weather.auroraLatitude}° lat</dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Density</dt>
          <dd className="font-mono">{weather.solarWindDensity.toFixed(1)} cm⁻³</dd>
        </div>
      </dl>
      {lastError && (
        <p className="mt-6 text-[11px] text-[var(--instrument-white)]/30">{lastError}</p>
      )}
    </div>
  )
}
