import { create } from 'zustand'
import { DEFAULT_WEATHER, type SpaceWeatherSnapshot, type PollingStatus } from '../api/types'

export interface InteractionState {
  /** Normalized UV 0–1 (origin bottom-left to match GLSL) */
  x: number
  y: number
  /** 0 = resting, 1 = full local perturbation */
  strength: number
  active: boolean
}

interface AuroraState {
  weather: SpaceWeatherSnapshot
  pollingStatus: PollingStatus
  lastError: string | null
  interaction: InteractionState
  calibrated: boolean
  legendOpen: boolean
  panelExpanded: boolean
  webglFailed: boolean
  reducedMotion: boolean
  fpsDegraded: boolean

  setWeather: (w: SpaceWeatherSnapshot) => void
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
}

const idleInteraction: InteractionState = {
  x: 0.5,
  y: 0.5,
  strength: 0,
  active: false,
}

export const useAuroraStore = create<AuroraState>((set) => ({
  weather: DEFAULT_WEATHER,
  pollingStatus: 'idle',
  lastError: null,
  interaction: idleInteraction,
  calibrated: false,
  legendOpen: true,
  panelExpanded: false,
  webglFailed: false,
  reducedMotion: false,
  fpsDegraded: false,

  setWeather: (weather) => set({ weather }),
  setPollingStatus: (pollingStatus) => set({ pollingStatus }),
  setLastError: (lastError) => set({ lastError }),
  setInteraction: (partial) =>
    set((s) => ({ interaction: { ...s.interaction, ...partial } })),
  setCalibrated: (calibrated) => set({ calibrated }),
  setLegendOpen: (legendOpen) => set({ legendOpen }),
  setPanelExpanded: (panelExpanded) => set({ panelExpanded }),
  togglePanel: () => set((s) => ({ panelExpanded: !s.panelExpanded })),
  setWebglFailed: (webglFailed) => set({ webglFailed }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setFpsDegraded: (fpsDegraded) => set({ fpsDegraded }),
}))

export { DEFAULT_WEATHER }
