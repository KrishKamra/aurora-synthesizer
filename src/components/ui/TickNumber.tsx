import { useEffect, useRef, useState } from 'react'

interface TickNumberProps {
  value: number
  decimals?: number
  durationMs?: number
  className?: string
  /** Prefix / suffix around the ticking figure */
  prefix?: string
  suffix?: string
}

/**
 * Numbers tick/flip toward the target rather than snap — instrument feel.
 */
export function TickNumber({
  value,
  decimals = 0,
  durationMs = 900,
  className,
  prefix = '',
  suffix = '',
}: TickNumberProps) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const startRef = useRef(0)
  const targetRef = useRef(value)
  const rafRef = useRef(0)

  useEffect(() => {
    fromRef.current = display
    targetRef.current = value
    startRef.current = performance.now()

    const step = (now: number) => {
      const t = Math.min((now - startRef.current) / durationMs, 1)
      // ease-out cubic
      const e = 1 - Math.pow(1 - t, 3)
      const next = fromRef.current + (targetRef.current - fromRef.current) * e
      setDisplay(next)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // only re-run when value changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs])

  return (
    <span className={className}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
