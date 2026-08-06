import { useCallback, useEffect, useRef } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuroraScene } from './components/scene/AuroraScene'
import { CalibrationOverlay } from './components/ui/CalibrationOverlay'
import { Fallback } from './components/ui/Fallback'
import { InstrumentHUD } from './components/ui/InstrumentHUD'
import { LiveRegion } from './components/ui/LiveRegion'
import { useAudioDrone } from './hooks/useAudioDrone'
import { useInteraction } from './hooks/useInteraction'
import { useReducedMotion } from './hooks/useReducedMotion'
import { useSpaceWeather } from './hooks/useSpaceWeather'
import { useAuroraStore } from './store/auroraStore'
import { isWebGLAvailable } from './utils/webgl'

/**
 * Aurora Synthesizer — single full-bleed WebGL instrument.
 * Field dials (live NOAA or manual scrub) are the only inputs to the aurora shader.
 */
export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const webglFailed = useAuroraStore((s) => s.webglFailed)
  const setWebglFailed = useAuroraStore((s) => s.setWebglFailed)
  const reducedMotion = useAuroraStore((s) => s.reducedMotion)
  const { audioEnabled, toggleFromGesture } = useAudioDrone()

  useReducedMotion()
  useSpaceWeather()
  useInteraction(containerRef)

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglFailed(true)
    }
  }, [setWebglFailed])

  const onGlError = useCallback(() => {
    setWebglFailed(true)
  }, [setWebglFailed])

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      style={{ background: 'var(--void)' }}
    >
      <LiveRegion />

      {webglFailed ? (
        <Fallback />
      ) : (
        <ErrorBoundary onError={onGlError} fallback={<Fallback />}>
          <AuroraScene />
          <CalibrationOverlay />
          <InstrumentHUD />

          {/* Audio must start inside this click (user gesture → AudioContext) */}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => {
                void toggleFromGesture()
              }}
              className="absolute bottom-4 right-4 z-20 rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[var(--instrument-white)]/55 backdrop-blur-md hover:text-[var(--instrument-white)] sm:bottom-4 sm:right-4"
              aria-pressed={audioEnabled}
              aria-label={
                audioEnabled
                  ? 'Mute ambient field drone'
                  : 'Enable ambient field drone mapped to Bz and solar wind'
              }
            >
              {audioEnabled ? 'audio on' : 'audio'}
            </button>
          )}
        </ErrorBoundary>
      )}
    </div>
  )
}
