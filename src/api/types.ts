/** Live space-weather snapshot derived from NOAA SWPC public JSON products. */
export interface SpaceWeatherSnapshot {
  /** Planetary K-index 0–9 */
  kp: number
  /** Interplanetary magnetic field Bz component (nT). Negative favors aurora. */
  bz: number
  /** Solar wind bulk speed (km/s) */
  solarWindSpeed: number
  /** Solar wind proton density (cm⁻³) */
  solarWindDensity: number
  /** Approximate equatorward edge of visible aurora band (degrees latitude) */
  auroraLatitude: number
  /** Max OVATION probability 0–100 if available */
  ovationMax: number | null
  /** Wall-clock of last successful fetch */
  fetchedAt: number
  /** Human activity band derived from Kp */
  activityLabel: string
}

export type PollingStatus = 'idle' | 'loading' | 'success' | 'error' | 'stale'

export function activityLabelFromKp(kp: number): string {
  if (kp < 1) return 'Quiet'
  if (kp < 3) return 'Unsettled'
  if (kp < 5) return 'Active'
  if (kp < 7) return 'Storm'
  if (kp < 8) return 'Strong storm'
  return 'Severe storm'
}

/** Rough heuristic: higher Kp pushes the auroral oval equatorward. */
export function latitudeFromKp(kp: number): number {
  // Quiet ~67°, severe storm ~50°
  const t = Math.min(Math.max(kp / 9, 0), 1)
  return Math.round((67 - t * 17) * 10) / 10
}

/** Sensible defaults used before first fetch and for static shader previews. */
export const DEFAULT_WEATHER: SpaceWeatherSnapshot = {
  kp: 3,
  bz: -2,
  solarWindSpeed: 420,
  solarWindDensity: 6,
  auroraLatitude: 62,
  ovationMax: null,
  fetchedAt: 0,
  activityLabel: 'Unsettled',
}
