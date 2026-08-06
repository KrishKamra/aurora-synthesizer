import {
  activityLabelFromKp,
  DEFAULT_WEATHER,
  latitudeFromKp,
  type SpaceWeatherSnapshot,
} from './types'

// NOAA SWPC endpoints are public, keyless, and CORS-open. No auth required for MVP.
// Note: legacy /products/solar-wind/*-1-day.json paths 404 as of 2026; use summary + RTSW.
const ENDPOINTS = {
  kp: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
  magSummary: 'https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json',
  speedSummary: 'https://services.swpc.noaa.gov/products/summary/solar-wind-speed.json',
  plasmaRtsw: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json',
  ovation: 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
} as const

interface KpRow {
  time_tag?: string
  Kp?: number | string
  kp?: number | string
}

interface MagSummaryRow {
  bt?: number
  bz_gsm?: number
  time_tag?: string
}

interface SpeedSummaryRow {
  proton_speed?: number
  time_tag?: string
}

interface PlasmaRtswRow {
  time_tag?: string
  proton_speed?: number | null
  proton_density?: number | null
  active?: boolean
}

interface OvationPayload {
  Observation_Time?: string
  Forecast_Time?: string
  coordinates?: [number, number, number][]
}

function lastDefined<T>(rows: T[], pick: (row: T) => number | null | undefined): number | null {
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (row == null) continue
    const n = pick(row)
    if (typeof n === 'number' && Number.isFinite(n)) return n
  }
  return null
}

function parseKp(data: KpRow[] | string[][]): number {
  // New object format (2026+): [{ time_tag, Kp, ... }]
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !Array.isArray(data[0])) {
    const rows = data as KpRow[]
    const kp = lastDefined(rows, (r) => {
      const v = r.Kp ?? r.kp
      return v == null ? null : Number(v)
    })
    return kp ?? 2
  }
  // Legacy table format: first row headers, then string cells
  const table = data as string[][]
  for (let i = table.length - 1; i >= 1; i--) {
    const raw = table[i]?.[1]
    if (raw == null || raw === '' || raw === 'null') continue
    const n = Number(raw)
    if (Number.isFinite(n)) return n
  }
  return 2
}

function parseOvationMax(data: OvationPayload): number | null {
  if (!data.coordinates?.length) return null
  let max = 0
  for (const c of data.coordinates) {
    const p = c[2]
    if (typeof p === 'number' && p > max) max = p
  }
  return max
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  // NOAA SWPC endpoints are public, keyless, and CORS-open. No auth required for MVP.
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`NOAA fetch failed ${res.status}: ${url}`)
  }
  return res.json() as Promise<T>
}

/**
 * Fetch the latest space-weather snapshot from NOAA SWPC.
 * Products are requested in parallel; partial failure falls back to safe defaults.
 */
export async function fetchSpaceWeather(
  signal?: AbortSignal,
): Promise<SpaceWeatherSnapshot> {
  // NOAA SWPC endpoints are public, keyless, and CORS-open. No auth required for MVP.
  const [kpRes, magRes, speedRes, plasmaRes, ovationRes] = await Promise.allSettled([
    fetchJson<KpRow[] | string[][]>(ENDPOINTS.kp, signal),
    fetchJson<MagSummaryRow[]>(ENDPOINTS.magSummary, signal),
    fetchJson<SpeedSummaryRow[]>(ENDPOINTS.speedSummary, signal),
    fetchJson<PlasmaRtswRow[]>(ENDPOINTS.plasmaRtsw, signal),
    fetchJson<OvationPayload>(ENDPOINTS.ovation, signal),
  ])

  const kp = kpRes.status === 'fulfilled' ? parseKp(kpRes.value) : 2

  const bz =
    magRes.status === 'fulfilled'
      ? (lastDefined(magRes.value, (r) => r.bz_gsm) ?? 0)
      : 0

  let speed = 400
  if (speedRes.status === 'fulfilled') {
    speed = lastDefined(speedRes.value, (r) => r.proton_speed) ?? 400
  }

  let density = 5
  if (plasmaRes.status === 'fulfilled') {
    density = lastDefined(plasmaRes.value, (r) => r.proton_density) ?? 5
    // Prefer RTSW speed if summary missing
    if (speedRes.status !== 'fulfilled') {
      speed = lastDefined(plasmaRes.value, (r) => r.proton_speed) ?? speed
    }
  }

  const ovationMax =
    ovationRes.status === 'fulfilled' ? parseOvationMax(ovationRes.value) : null

  const anyOk = [kpRes, magRes, speedRes, plasmaRes, ovationRes].some(
    (r) => r.status === 'fulfilled',
  )
  if (!anyOk) {
    throw new Error('All NOAA SWPC endpoints failed')
  }

  return {
    kp,
    bz,
    solarWindSpeed: speed,
    solarWindDensity: density,
    auroraLatitude: latitudeFromKp(kp),
    ovationMax,
    fetchedAt: Date.now(),
    activityLabel: activityLabelFromKp(kp),
  }
}

export { DEFAULT_WEATHER }
