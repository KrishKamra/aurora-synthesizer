import type { CSSProperties } from 'react'
import type { FieldKey } from '../../store/auroraStore'

interface TelemetryFieldProps {
  id: string
  label: string
  fieldKey: FieldKey
  value: number
  min: number
  max: number
  step: number
  decimals?: number
  unit: string
  /** Live NOAA reference for the same key (shown when scrubbing). */
  liveValue?: number
  hint?: string
  onChange: (key: FieldKey, value: number) => void
  accent?: 'green' | 'magenta' | 'amber' | 'white'
}

const accentVar: Record<NonNullable<TelemetryFieldProps['accent']>, string> = {
  green: 'var(--aurora-green)',
  magenta: 'var(--aurora-magenta)',
  amber: 'var(--amber)',
  white: 'var(--instrument-white)',
}

/**
 * Instrument dial: range input bound to a field param that drives the aurora.
 */
export function TelemetryField({
  id,
  label,
  fieldKey,
  value,
  min,
  max,
  step,
  decimals = 1,
  unit,
  liveValue,
  hint,
  onChange,
  accent = 'white',
}: TelemetryFieldProps) {
  const pct = ((value - min) / (max - min)) * 100
  const color = accentVar[accent]
  const drifted =
    liveValue != null && Math.abs(liveValue - value) > step * 0.51

  return (
    <div className="group" data-selectable>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <label
          htmlFor={id}
          className="text-[10px] uppercase tracking-[0.2em] text-[var(--instrument-white)]/45"
          title={hint}
        >
          {label}
        </label>
        <span className="font-mono text-xs tabular-nums" style={{ color }}>
          {value.toFixed(decimals)}
          <span className="ml-1 text-[10px] text-[var(--instrument-white)]/40">{unit}</span>
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={`${label}, ${value.toFixed(decimals)} ${unit}`}
        onChange={(e) => onChange(fieldKey, Number(e.target.value))}
        className="telemetry-slider w-full"
        style={
          {
            '--track-pct': `${pct}%`,
            '--accent': color,
          } as CSSProperties
        }
      />
      {drifted && liveValue != null && (
        <p className="mt-0.5 font-mono text-[9px] text-[var(--instrument-white)]/30">
          live {liveValue.toFixed(decimals)}
          {unit ? ` ${unit}` : ''}
        </p>
      )}
    </div>
  )
}
