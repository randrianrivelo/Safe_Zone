// src/components/UI/SwipeCard.jsx
import { useEffect, useRef } from 'react'

const TRANSFORMS = {
  left: 'translateX(-40px)',
  right: 'translateX(40px)',
  up: 'translateY(30px)',
  down: 'translateY(-30px)'
}

export default function SwipeCard({
  children,
  direction = 'left',
  delay = 0,
  className = '',
  style = {}
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.style.opacity = '0'
    el.style.transform = TRANSFORMS[direction] || TRANSFORMS.left

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
          el.style.opacity = '1'
          el.style.transform = 'translateX(0) translateY(0)'
        }, delay)
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [direction, delay])

  return (
    <div
      ref={ref}
      className={className}
      style={{ willChange: 'transform, opacity', ...style }}
    >
      {children}
    </div>
  )
}