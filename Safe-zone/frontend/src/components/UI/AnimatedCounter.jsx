// src/components/UI/AnimatedCounter.jsx
import { useState, useEffect, useRef } from 'react'

export default function AnimatedCounter({
  end = 0,
  duration = 1500,
  prefix = '',
  suffix = '',
  style = {},
  className = ''
}) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  const raf = useRef(null)

  useEffect(() => {
    started.current = false
    setValue(0)

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const startTime = Date.now()
        const tick = () => {
          const elapsed = Date.now() - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(Math.floor(eased * end))
          if (progress < 1) {
            raf.current = requestAnimationFrame(tick)
          } else {
            setValue(end)
          }
        }
        raf.current = requestAnimationFrame(tick)
      }
    }, { threshold: 0.2 })

    if (ref.current) observer.observe(ref.current)

    return () => {
      observer.disconnect()
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [end, duration])

  return (
    <span ref={ref} style={style} className={className}>
      {prefix}{value.toLocaleString('fr-FR')}{suffix}
    </span>
  )
}