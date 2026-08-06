import { useAuroraStore } from '../../store/auroraStore'
import { TickNumber } from './TickNumber'

function statusColor(status: string): string {
  if (status === 'success') return 'var(--amber)'
  if (status === 'error') return '#ff6b6b'
  if (status === 'stale') return 'var(--amber)'
  return 'var(--instrument-white)'
}

function statusLabel(status: string): string {
  switch (status) {
    case 'loading':
      return 'SYNC'
    case 'success':
      return 'LIVE'
    case 'stale':
      return 'STALE'
    case 'error':
      return 'ERR'
    default:
      return '—'
  }
}

/** Bottom-left instrument HUD — Kp dominant, supporting metrics quiet. */
export function KpReadout() {
  const weather = useAuroraStore((s) => s.weather)
  const pollingStatus = useAuroraStore((s) => s.pollingStatus)

  return (
    <div
      className="pointer-events-none select-none"
      data-selectable
      aria-label={`Kp index ${weather.kp.toFixed(1)}, ${weather.activityLabel}`}
    >
      <div className="flex items-start gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--instrument-white)]/45">
              Planetary K
            </span>
            <span
              className="inline-flex items-center gap-1 font-mono text-[9px] tracking-wider"
              style={{ color: statusColor(pollingStatus) }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{
                  background: statusColor(pollingStatus),
                  boxShadow:
                    pollingStatus === 'success'
                      ? '0 0 6px var(--amber)'
                      : undefined,
                }}
                aria-hidden
              />
              {statusLabel(pollingStatus)}
            </span>
          </div>
          <div className="font-mono text-5xl font-semibold leading-none tracking-tight text-[var(--instrument-white)] sm:text-6xl">
            <TickNumber value={weather.kp} decimals={1} />
          </div>
          <p className="mt-1.5 text-xs text-[var(--aurora-green)]/90">
            {weather.activityLabel}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] sm:text-xs">
        <div>
          <dt className="text-[var(--instrument-white)]/40">Bz</dt>
          <dd className="font-mono text-[var(--instrument-white)]/90">
            <TickNumber value={weather.bz} decimals={1} suffix=" nT" />
          </dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Solar wind</dt>
          <dd className="font-mono text-[var(--instrument-white)]/90">
            <TickNumber value={weather.solarWindSpeed} decimals={0} suffix=" km/s" />
          </dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Aurora edge</dt>
          <dd className="font-mono text-[var(--instrument-white)]/90">
            ≈ <TickNumber value={weather.auroraLatitude} decimals={0} suffix="° lat" />
          </dd>
        </div>
        <div>
          <dt className="text-[var(--instrument-white)]/40">Density</dt>
          <dd className="font-mono text-[var(--instrument-white)]/90">
            <TickNumber value={weather.solarWindDensity} decimals={1} suffix=" cm⁻³" />
          </dd>
        </div>
      </dl>
    </div>
  )
}
