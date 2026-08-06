import { useEffect, useRef } from 'react'
import { useAuroraStore } from '../store/auroraStore'

/**
 * Optional restrained Web Audio drone.
 * Pitch primarily from Bz, amplitude from solar wind speed.
 * Weather report, not game soundtrack.
 */
export function useAudioDrone(enabled: boolean) {
  const weather = useAuroraStore((s) => s.weather)
  const reducedMotion = useAuroraStore((s) => s.reducedMotion)
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (!enabled || reducedMotion) {
      if (ctxRef.current) {
        void ctxRef.current.close()
        ctxRef.current = null
        oscRef.current = null
        gainRef.current = null
      }
      return
    }

    // Start only after a user gesture would normally be required —
    // we keep this optional and quiet; resume is attempted lazily.
    const ensure = async () => {
      if (!ctxRef.current) {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 55
        gain.gain.value = 0
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        ctxRef.current = ctx
        oscRef.current = osc
        gainRef.current = gain
      }
      if (ctxRef.current.state === 'suspended') {
        try {
          await ctxRef.current.resume()
        } catch {
          /* autoplay blocked — silent until gesture */
        }
      }
    }

    const onGesture = () => {
      void ensure()
      window.removeEventListener('pointerdown', onGesture)
    }
    window.addEventListener('pointerdown', onGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', onGesture)
      if (ctxRef.current) {
        void ctxRef.current.close()
        ctxRef.current = null
        oscRef.current = null
        gainRef.current = null
      }
    }
  }, [enabled, reducedMotion])

  useEffect(() => {
    if (!enabled || reducedMotion || !oscRef.current || !gainRef.current || !ctxRef.current)
      return
    const { bz, solarWindSpeed } = weather
    // Bz: more negative → slightly higher pitch (energized)
    const pitch = 48 + Math.min(Math.max(-bz, -20), 20) * 0.8
    // Wind: 300–800 → very quiet amplitude
    const amp = Math.min(Math.max((solarWindSpeed - 300) / 500, 0), 1) * 0.018
    const t = ctxRef.current.currentTime
    oscRef.current.frequency.linearRampToValueAtTime(pitch, t + 0.8)
    gainRef.current.gain.linearRampToValueAtTime(amp, t + 0.8)
  }, [weather, enabled, reducedMotion])
}
