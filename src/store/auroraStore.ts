import { useMemo } from 'react'
import { create } from 'zustand'
import {
  activityLabelFromKp,
  DEFAULT_WEATHER,
  latitudeFromKp,
  type SpaceWeatherSnapshot,
  type PollingStatus,
} from '../api/types'

export interface InteractionState {
  /** Normalized UV 0–1 (origin bottom-left to match GLSL) */
  x: number
  y: number
  /** 0 = resting, 1 = full local perturbation */
  strength: number
  active: boolean
}

/** Controls that map 1:1 onto aurora shader uniforms. */
export interface FieldParams {
  kp: number
  bz: number
  solarWindSpeed: number
  solarWindDensity: number
}

export type FieldSource = 'live' | 'manual'

export type FieldKey = keyof FieldParams

interface AuroraState {
  /** Last successful NOAA snapshot (never overwritten by UI scrubbing). */
  liveWeather: SpaceWeatherSnapshot
  /**
   * Active instrument fields — single source of truth for the aurora shader,
   * HUD numbers, and optional audio mapping.
   */
  field: FieldParams
  /** live = follow NOAA; manual = user owns the dials until snap-to-live. */
  fieldSource: FieldSource
  pollingStatus: PollingStatus
  lastError: string | null
  interaction: InteractionState
  calibrated: boolean
  legendOpen: boolean
  panelExpanded: boolean
  webglFailed: boolean
  reducedMotion: boolean
  fpsDegraded: boolean
  audioEnabled: boolean

  /** Ingest NOAA; if fieldSource is live, also refresh field dials. */
  applyLiveWeather: (w: SpaceWeatherSnapshot) => void
  setFieldParam: (key: FieldKey, value: number) => void
  snapFieldToLive: () => void
  setPollingStatus: (s: PollingStatus) => void
  setLastError: (e: string | null) => void
  setInteraction: (partial: Partial<InteractionState>) => void
  setCalibrated: (v: boolean) => void
  setLegendOpen: (v: boolean) => void
  setPanelExpanded: (v: boolean) => void
  togglePanel: () => void
  setWebglFailed: (v: boolean) => void
  setReducedMotion: (v: boolean) => void
  setFpsDegraded: (v: boolean) => void
  setAudioEnabled: (v: boolean) => void
  toggleAudio: () => void
}

const idleInteraction: InteractionState = {
  x: 0.5,
  y: 0.5,
  strength: 0,
  active: false,
}

function fieldFromWeather(w: SpaceWeatherSnapshot): FieldParams {
  return {
    kp: w.kp,
    bz: w.bz,
    solarWindSpeed: w.solarWindSpeed,
    solarWindDensity: w.solarWindDensity,
  }
}

function clampField(key: FieldKey, value: number): number {
  switch (key) {
    case 'kp':
      return Math.min(9, Math.max(0, value))
    case 'bz':
      return Math.min(20, Math.max(-30, value))
    case 'solarWindSpeed':
      return Math.min(1000, Math.max(200, value))
    case 'solarWindDensity':
      return Math.min(50, Math.max(0.1, value))
    default:
      return value
  }
}

/** Build a full snapshot for HUD/live region from active field + live metadata. */
export function snapshotFromField(
  field: FieldParams,
  live: SpaceWeatherSnapshot,
  fieldSource: FieldSource,
): SpaceWeatherSnapshot {
  return {
    ...live,
    kp: field.kp,
    bz: field.bz,
    solarWindSpeed: field.solarWindSpeed,
    solarWindDensity: field.solarWindDensity,
    auroraLatitude: latitudeFromKp(field.kp),
    activityLabel: activityLabelFromKp(field.kp),
    // Keep live fetch time only when still following live
    fetchedAt: fieldSource === 'live' ? live.fetchedAt : live.fetchedAt,
  }
}

export const useAuroraStore = create<AuroraState>((set, get) => ({
  liveWeather: DEFAULT_WEATHER,
  field: fieldFromWeather(DEFAULT_WEATHER),
  fieldSource: 'live',
  pollingStatus: 'idle',
  lastError: null,
  interaction: idleInteraction,
  calibrated: false,
  legendOpen: true,
  panelExpanded: false,
  webglFailed: false,
  reducedMotion: false,
  fpsDegraded: false,
  audioEnabled: false,

  applyLiveWeather: (liveWeather) => {
    const { fieldSource } = get()
    if (fieldSource === 'live') {
      set({ liveWeather, field: fieldFromWeather(liveWeather) })
    } else {
      set({ liveWeather })
    }
  },

  setFieldParam: (key, value) => {
    const next = clampField(key, value)
    set((s) => {
      if (s.field[key] === next && s.fieldSource === 'manual') return s
      return {
        fieldSource: 'manual' as const,
        field: { ...s.field, [key]: next },
      }
    })
  },

  snapFieldToLive: () => {
    const { liveWeather } = get()
    set({
      fieldSource: 'live',
      field: fieldFromWeather(liveWeather),
    })
  },

  setPollingStatus: (pollingStatus) =>
    set((s) => (s.pollingStatus === pollingStatus ? s : { pollingStatus })),
  setLastError: (lastError) =>
    set((s) => (s.lastError === lastError ? s : { lastError })),
  setInteraction: (partial) =>
    set((s) => {
      const next = { ...s.interaction, ...partial }
      const prev = s.interaction
      if (
        prev.x === next.x &&
        prev.y === next.y &&
        prev.strength === next.strength &&
        prev.active === next.active
      ) {
        return s
      }
      return { interaction: next }
    }),
  setCalibrated: (calibrated) =>
    set((s) => (s.calibrated === calibrated ? s : { calibrated })),
  setLegendOpen: (legendOpen) =>
    set((s) => (s.legendOpen === legendOpen ? s : { legendOpen })),
  setPanelExpanded: (panelExpanded) =>
    set((s) => (s.panelExpanded === panelExpanded ? s : { panelExpanded })),
  togglePanel: () => set((s) => ({ panelExpanded: !s.panelExpanded })),
  setWebglFailed: (webglFailed) =>
    set((s) => (s.webglFailed === webglFailed ? s : { webglFailed })),
  setReducedMotion: (reducedMotion) =>
    set((s) => (s.reducedMotion === reducedMotion ? s : { reducedMotion })),
  setFpsDegraded: (fpsDegraded) =>
    set((s) => (s.fpsDegraded === fpsDegraded ? s : { fpsDegraded })),
  setAudioEnabled: (audioEnabled) =>
    set((s) => (s.audioEnabled === audioEnabled ? s : { audioEnabled })),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
}))

/**
 * Display weather derived from field dials.
 * Must NOT return a fresh object from a Zustand selector each getSnapshot
 * (that triggers React “Maximum update depth exceeded”).
 */
export function useDisplayWeather(): SpaceWeatherSnapshot {
  const field = useAuroraStore((s) => s.field)
  const liveWeather = useAuroraStore((s) => s.liveWeather)
  const fieldSource = useAuroraStore((s) => s.fieldSource)

  return useMemo(
    () => snapshotFromField(field, liveWeather, fieldSource),
    [field, liveWeather, fieldSource],
  )
}

export { DEFAULT_WEATHER }
