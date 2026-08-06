import { useCallback, useEffect, useRef, useState } from 'react'
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
 * React only computes uniforms and HUD; the shader owns every aurora pixel.
 */
export default function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  const webglFailed = useAuroraStore((s) => s.webglFailed)
  const setWebglFailed = useAuroraStore((s) => s.setWebglFailed)
  const [audioOn, setAudioOn] = useState(false)

  useReducedMotion()
  useSpaceWeather()
  useInteraction(containerRef)
  useAudioDrone(audioOn)

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

          {/* Quiet optional audio toggle — restrained, not a game soundtrack */}
          <button
            type="button"
            onClick={() => setAudioOn((v) => !v)}
            className="absolute bottom-4 right-4 z-20 hidden rounded border border-[var(--panel-border)] bg-[var(--panel-bg)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--instrument-white)]/45 backdrop-blur-md hover:text-[var(--instrument-white)]/80 sm:block"
            aria-pressed={audioOn}
            aria-label={audioOn ? 'Mute ambient drone' : 'Enable ambient drone'}
          >
            {audioOn ? 'audio on' : 'audio'}
          </button>
        </ErrorBoundary>
      )}
    </div>
  )
}
