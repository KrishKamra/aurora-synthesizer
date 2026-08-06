import { useCallback, useEffect, useRef, type RefObject } from 'react'
import { useAuroraStore } from '../store/auroraStore'

const DECAY_SECONDS = 1.5

/**
 * Pointer + touch interaction layer.
 * Real data is always the resting state; interaction only adds temporary local perturbation.
 * Multi-touch is ignored (prevents accidental multi-finger noise).
 */
export function useInteraction(containerRef: RefObject<HTMLElement | null>) {
  const setInteraction = useAuroraStore((s) => s.setInteraction)
  const reducedMotion = useAuroraStore((s) => s.reducedMotion)
  const activeRef = useRef(false)
  const strengthRef = useRef(0)
  const posRef = useRef({ x: 0.5, y: 0.5 })
  const lastTsRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  const toUv = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return { x: 0.5, y: 0.5 }
    const rect = el.getBoundingClientRect()
    const x = (clientX - rect.left) / Math.max(rect.width, 1)
    // GLSL UV origin is bottom-left
    const y = 1 - (clientY - rect.top) / Math.max(rect.height, 1)
    return {
      x: Math.min(Math.max(x, 0), 1),
      y: Math.min(Math.max(y, 0), 1),
    }
  }, [containerRef])

  // Decay loop — smooth 1.5s falloff after pointer/touch leaves
  useEffect(() => {
    const tick = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = Math.min((ts - lastTsRef.current) / 1000, 0.05)
      lastTsRef.current = ts

      if (!activeRef.current && strengthRef.current > 0.001) {
        // Exponential-ish decay over ~DECAY_SECONDS
        const rate = 1 / DECAY_SECONDS
        strengthRef.current = Math.max(0, strengthRef.current - rate * dt)
        setInteraction({
          x: posRef.current.x,
          y: posRef.current.y,
          strength: strengthRef.current,
          active: false,
        })
      } else if (!activeRef.current && strengthRef.current <= 0.001 && strengthRef.current !== 0) {
        strengthRef.current = 0
        setInteraction({ strength: 0, active: false })
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [setInteraction])

  useEffect(() => {
    const el = containerRef.current
    if (!el || reducedMotion) return

    /** HUD controls must receive normal clicks — never capture them for the field. */
    const isUiTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Boolean(
        target.closest(
          'button, a, input, textarea, select, label, [role="button"], [role="slider"], [data-selectable], [data-testid="mobile-chip"]',
        ),
      )
    }

    const onPointerDown = (e: PointerEvent) => {
      if (isUiTarget(e.target)) return
      // Multi-touch: ignore secondary contacts
      if (e.pointerType === 'touch' && e.isPrimary === false) return
      activeRef.current = true
      const uv = toUv(e.clientX, e.clientY)
      posRef.current = uv
      strengthRef.current = 1
      setInteraction({ ...uv, strength: 1, active: true })
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        /* ignore */
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      if (isUiTarget(e.target) && !activeRef.current) return
      if (e.pointerType === 'touch' && e.isPrimary === false) return
      // Desktop: move applies local curl; drag is stronger but move also works
      if (!activeRef.current && e.pointerType === 'touch') return
      const uv = toUv(e.clientX, e.clientY)
      posRef.current = uv
      // Hover on desktop gently engages; press is full
      if (e.pointerType === 'mouse' && !activeRef.current) {
        strengthRef.current = Math.max(strengthRef.current, 0.55)
      } else {
        strengthRef.current = 1
        activeRef.current = true
      }
      setInteraction({
        ...uv,
        strength: strengthRef.current,
        active: activeRef.current,
      })
    }

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && e.isPrimary === false) return
      activeRef.current = false
      setInteraction({ active: false })
      // strength decays via rAF loop
    }

    const onPointerLeave = () => {
      activeRef.current = false
      setInteraction({ active: false })
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    el.addEventListener('pointerleave', onPointerLeave)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
      el.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [containerRef, setInteraction, toUv, reducedMotion])
}
