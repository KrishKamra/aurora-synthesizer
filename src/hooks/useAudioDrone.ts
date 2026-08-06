import { useCallback, useEffect, useRef } from 'react'
import { useAuroraStore } from '../store/auroraStore'

/**
 * Restrained Web Audio drone driven by active field dials (same values as the aurora).
 * Pitch ← Bz (southward / more negative → higher), amplitude ← solar wind speed.
 * Must be started from a user gesture (button click calls startFromGesture).
 */
export function useAudioDrone() {
  const field = useAuroraStore((s) => s.field)
  const audioEnabled = useAuroraStore((s) => s.audioEnabled)
  const setAudioEnabled = useAuroraStore((s) => s.setAudioEnabled)
  const reducedMotion = useAuroraStore((s) => s.reducedMotion)

  const ctxRef = useRef<AudioContext | null>(null)
  const oscARef = useRef<OscillatorNode | null>(null)
  const oscBRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)

  const teardown = useCallback(() => {
    try {
      oscARef.current?.stop()
      oscBRef.current?.stop()
    } catch {
      /* already stopped */
    }
    oscARef.current = null
    oscBRef.current = null
    gainRef.current = null
    filterRef.current = null
    if (ctxRef.current) {
      void ctxRef.current.close()
      ctxRef.current = null
    }
  }, [])

  const applyParams = useCallback((bz: number, speed: number) => {
    const ctx = ctxRef.current
    const oscA = oscARef.current
    const oscB = oscBRef.current
    const gain = gainRef.current
    const filter = filterRef.current
    if (!ctx || !oscA || !oscB || !gain || !filter) return

    // Bz: -30…+20 → pitch ~42–78 Hz (sub-bass weather drone)
    const bzClamped = Math.min(20, Math.max(-30, bz))
    const pitch = 52 + (-bzClamped) * 0.9
    // Wind: always audible floor so quiet days still drone softly
    const windT = Math.min(Math.max((speed - 250) / 550, 0), 1)
    const amp = 0.012 + windT * 0.04

    const t = ctx.currentTime
    oscA.frequency.setTargetAtTime(pitch, t, 0.12)
    oscB.frequency.setTargetAtTime(pitch * 1.505, t, 0.12) // soft fifth/partial
    filter.frequency.setTargetAtTime(180 + windT * 220, t, 0.2)
    gain.gain.setTargetAtTime(amp, t, 0.15)
  }, [])

  /** Call from the audio button onClick so AudioContext unlocks under a gesture. */
  const startFromGesture = useCallback(async () => {
    if (reducedMotion) return

    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AC()
      const oscA = ctx.createOscillator()
      const oscB = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()
      const master = ctx.createGain()

      oscA.type = 'sine'
      oscB.type = 'triangle'
      oscA.frequency.value = 55
      oscB.frequency.value = 82.5
      // Quiet partial
      const partialGain = ctx.createGain()
      partialGain.gain.value = 0.28

      filter.type = 'lowpass'
      filter.frequency.value = 280
      filter.Q.value = 0.6

      gain.gain.value = 0.0001
      master.gain.value = 1

      oscA.connect(gain)
      oscB.connect(partialGain)
      partialGain.connect(gain)
      gain.connect(filter)
      filter.connect(master)
      master.connect(ctx.destination)

      oscA.start()
      oscB.start()

      ctxRef.current = ctx
      oscARef.current = oscA
      oscBRef.current = oscB
      gainRef.current = gain
      filterRef.current = filter
    }

    if (ctxRef.current.state === 'suspended') {
      await ctxRef.current.resume()
    }

    const { field: f } = useAuroraStore.getState()
    applyParams(f.bz, f.solarWindSpeed)
    setAudioEnabled(true)
  }, [applyParams, reducedMotion, setAudioEnabled])

  const stop = useCallback(() => {
    const ctx = ctxRef.current
    const gain = gainRef.current
    if (ctx && gain) {
      const t = ctx.currentTime
      gain.gain.cancelScheduledValues(t)
      gain.gain.setTargetAtTime(0.0001, t, 0.05)
      window.setTimeout(() => {
        teardown()
        setAudioEnabled(false)
      }, 200)
    } else {
      teardown()
      setAudioEnabled(false)
    }
  }, [setAudioEnabled, teardown])

  const toggleFromGesture = useCallback(async () => {
    if (audioEnabled) {
      stop()
    } else {
      await startFromGesture()
    }
  }, [audioEnabled, startFromGesture, stop])

  // Track field dials while running
  useEffect(() => {
    if (!audioEnabled || reducedMotion) return
    applyParams(field.bz, field.solarWindSpeed)
  }, [field.bz, field.solarWindSpeed, audioEnabled, reducedMotion, applyParams])

  // Tear down on unmount or reduced-motion
  useEffect(() => {
    if (reducedMotion && audioEnabled) {
      stop()
    }
  }, [reducedMotion, audioEnabled, stop])

  useEffect(() => () => teardown(), [teardown])

  return {
    audioEnabled,
    toggleFromGesture,
    startFromGesture,
    stop,
  }
}
