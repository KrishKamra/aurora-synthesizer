import {
  useAuroraStore,
  useDisplayWeather,
  type FieldKey,
} from '../../store/auroraStore'
import { TickNumber } from './TickNumber'
import { TelemetryField } from './TelemetryField'

function statusColor(status: string): string {
  if (status === 'success') return 'var(--amber)'
  if (status === 'error') return '#ff6b6b'
  if (status === 'stale') return 'var(--amber)'
  return 'var(--instrument-white)'
}

function statusLabel(status: string, fieldSource: string): string {
  if (fieldSource === 'manual') return 'SCRUB'
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

/** Bottom-left instrument HUD — interactive field dials drive the aurora. */
export function KpReadout() {
  const field = useAuroraStore((s) => s.field)
  const liveWeather = useAuroraStore((s) => s.liveWeather)
  const fieldSource = useAuroraStore((s) => s.fieldSource)
  const setFieldParam = useAuroraStore((s) => s.setFieldParam)
  const snapFieldToLive = useAuroraStore((s) => s.snapFieldToLive)
  const pollingStatus = useAuroraStore((s) => s.pollingStatus)
  const display = useDisplayWeather()

  const onChange = (key: FieldKey, value: number) => {
    setFieldParam(key, value)
  }

  return (
    <div
      className="select-none"
      data-selectable
      aria-label={`Kp index ${display.kp.toFixed(1)}, ${display.activityLabel}. Drag dials to reshape the aurora.`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.28em] text-[var(--instrument-white)]/45">
            Planetary K
          </span>
          <span
            className="inline-flex items-center gap-1 font-mono text-[9px] tracking-wider"
            style={{
              color:
                fieldSource === 'manual'
                  ? 'var(--aurora-magenta)'
                  : statusColor(pollingStatus),
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background:
                  fieldSource === 'manual'
                    ? 'var(--aurora-magenta)'
                    : statusColor(pollingStatus),
                boxShadow:
                  fieldSource === 'live' && pollingStatus === 'success'
                    ? '0 0 6px var(--amber)'
                    : fieldSource === 'manual'
                      ? '0 0 6px var(--aurora-magenta)'
                      : undefined,
              }}
              aria-hidden
            />
            {statusLabel(pollingStatus, fieldSource)}
          </span>
        </div>
        {fieldSource === 'manual' && (
          <button
            type="button"
            onClick={snapFieldToLive}
            className="rounded border border-[var(--panel-border)] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--amber)] hover:bg-white/5"
            title="Reset dials to latest NOAA values"
          >
            snap live
          </button>
        )}
      </div>

      <div className="font-mono text-5xl font-semibold leading-none tracking-tight text-[var(--instrument-white)] sm:text-6xl">
        <TickNumber value={field.kp} decimals={1} durationMs={280} />
      </div>
      <p className="mt-1.5 text-xs text-[var(--aurora-green)]/90">
        {display.activityLabel}
        <span className="ml-2 text-[var(--instrument-white)]/35">
          ≈ {display.auroraLatitude.toFixed(0)}° lat
        </span>
      </p>

      <div className="mt-4 space-y-3">
        <TelemetryField
          id="field-kp"
          label="Kp"
          fieldKey="kp"
          value={field.kp}
          min={0}
          max={9}
          step={0.1}
          decimals={1}
          unit=""
          liveValue={liveWeather.kp}
          hint="Ribbon height & intensity"
          onChange={onChange}
          accent="green"
        />
        <TelemetryField
          id="field-bz"
          label="Bz"
          fieldKey="bz"
          value={field.bz}
          min={-30}
          max={20}
          step={0.1}
          decimals={1}
          unit="nT"
          liveValue={liveWeather.bz}
          hint="Southward (negative) shifts green → magenta"
          onChange={onChange}
          accent="magenta"
        />
        <TelemetryField
          id="field-wind"
          label="Solar wind"
          fieldKey="solarWindSpeed"
          value={field.solarWindSpeed}
          min={200}
          max={900}
          step={1}
          decimals={0}
          unit="km/s"
          liveValue={liveWeather.solarWindSpeed}
          hint="Flow speed of the curtains"
          onChange={onChange}
          accent="amber"
        />
        <TelemetryField
          id="field-density"
          label="Density"
          fieldKey="solarWindDensity"
          value={field.solarWindDensity}
          min={0.5}
          max={30}
          step={0.1}
          decimals={1}
          unit="cm⁻³"
          liveValue={liveWeather.solarWindDensity}
          hint="Fill / brightness of the band"
          onChange={onChange}
          accent="white"
        />
      </div>

      <p className="mt-3 text-[10px] leading-snug text-[var(--instrument-white)]/35">
        {fieldSource === 'live'
          ? 'Dials track NOAA. Scrub any field to explore — aurora responds immediately.'
          : 'Manual mode — field values drive the aurora. Snap live to rejoin the feed.'}
      </p>
    </div>
  )
}
