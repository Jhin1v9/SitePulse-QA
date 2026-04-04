import { useEffect, useRef } from 'react'

export function useAnimateValue(
  id: string,
  end: number,
  duration: number,
  suffix = '',
  delayMs = 0
) {
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const el = document.getElementById(id)
    if (!el) return

    let timeoutId: ReturnType<typeof setTimeout>

    timeoutId = setTimeout(() => {
      const start = 0
      const range = end - start
      const minTimer = 50
      let stepTime = Math.abs(Math.floor(duration / range))
      stepTime = Math.max(stepTime, minTimer)

      const startTime = Date.now()
      const endTime = startTime + duration

      const timer = setInterval(() => {
        const now = Date.now()
        const remaining = Math.max((endTime - now) / duration, 0)
        const value = Math.round(end - remaining * range)
        el.innerHTML = value.toLocaleString() + suffix
        if (value === end) clearInterval(timer)
      }, stepTime)

      return () => clearInterval(timer)
    }, delayMs)

    return () => clearTimeout(timeoutId)
  }, [id, end, duration, suffix, delayMs])
}
