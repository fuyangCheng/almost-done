import { useEffect, useRef, useState } from 'react'

/**
 * Animates a numeric value from its previous state to `to`.
 * Returns the current display value (integer).
 *
 * @param {number} to       - Target value
 * @param {number} duration - Animation duration in ms (default 650)
 */
export function useCountUp(to, duration = 650) {
  const [display, setDisplay] = useState(to)
  const fromRef  = useRef(to)   // previous target
  const rafRef   = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    if (from === to) return

    // Cancel any in-flight animation
    cancelAnimationFrame(rafRef.current)

    const start = performance.now()

    const step = (now) => {
      const elapsed = now - start
      const t       = Math.min(elapsed / duration, 1)
      // Ease-out cubic: fast start → graceful deceleration
      const eased   = 1 - (1 - t) ** 3

      setDisplay(Math.round(from + (to - from) * eased))

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [to, duration])

  return display
}
