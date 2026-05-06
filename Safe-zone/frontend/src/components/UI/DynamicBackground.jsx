// src/components/UI/DynamicBackground.jsx
import { useState, useEffect, useRef } from 'react'

const VIDEOS = {
  day: 'https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4',
  night: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-night-sky-1610-large.mp4',
  storm: 'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-water-of-a-lake-seen-up-close-18312-large.mp4'
}

function getAutoMode() {
  const h = new Date().getHours()
  return h >= 6 && h < 18 ? 'day' : 'night'
}

export default function DynamicBackground({ showControls = true }) {
  const [mode, setMode] = useState(getAutoMode())
  const [opacity, setOpacity] = useState(1)
  const [isManual, setIsManual] = useState(false)
  const [time, setTime] = useState(new Date())
  const manualTimer = useRef(null)

  // Horloge
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Auto-détection heure
  useEffect(() => {
    if (isManual) return
    const check = setInterval(() => {
      const auto = getAutoMode()
      if (auto !== mode) switchTo(auto)
    }, 60000)
    return () => clearInterval(check)
  }, [isManual, mode])

  // Reset manuel après 2h
  useEffect(() => {
    if (!isManual) return
    if (manualTimer.current) clearTimeout(manualTimer.current)
    manualTimer.current = setTimeout(() => {
      setIsManual(false)
      switchTo(getAutoMode())
    }, 2 * 60 * 60 * 1000)
    return () => clearTimeout(manualTimer.current)
  }, [isManual])

  const switchTo = (newMode) => {
    setOpacity(0)
    setTimeout(() => {
      setMode(newMode)
      setOpacity(1)
    }, 800)
  }

  const handleManual = (m) => {
    setIsManual(true)
    switchTo(m)
  }

  const fmt = time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const fmtDate = time.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <>
      {/* Vidéo fond */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: -2, overflow: 'hidden'
      }}>
        <video
          key={mode}
          autoPlay muted loop playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity, transition: 'opacity 0.8s ease' }}
        >
          <source src={VIDEOS[mode]} type="video/mp4" />
        </video>
      </div>

      {/* Overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        background: 'var(--overlay-bg, rgba(240,251,250,0.2))',
        zIndex: -1, transition: 'background 0.5s'
      }} />

      {/* Horloge */}
      <div style={{
        position: 'fixed', top: 14, left: 18, zIndex: 2001,
        background: 'var(--bg-glass, rgba(255,255,255,0.6))',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border, #87ADC6)',
        borderRadius: 12, padding: '7px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: 'var(--shadow, 0 8px 32px rgba(0,0,0,0.15))'
      }}>
        <i className="bi bi-clock-fill" style={{ color: 'var(--safe, #1fbc34)' }} />
        <div>
          <div style={{
            fontFamily: 'monospace', fontWeight: 700,
            fontSize: '0.9rem', color: 'var(--text-primary, #203038)',
            lineHeight: 1.2
          }}>{fmt}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary, #578098)', lineHeight: 1.2 }}>
            {fmtDate}
          </div>
        </div>
        {isManual && (
          <span style={{
            fontSize: '0.58rem', fontWeight: 700,
            background: 'rgba(243,156,18,0.15)',
            color: '#f39c12', padding: '1px 5px', borderRadius: 6
          }}>MANUEL</span>
        )}
      </div>

      {/* Contrôles vidéo */}
      {showControls && (
        <div style={{
          position: 'fixed', bottom: 18,
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 2001, display: 'flex', gap: 7,
          background: 'var(--bg-glass, rgba(255,255,255,0.6))',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border, #87ADC6)',
          borderRadius: 50, padding: '7px 14px',
          boxShadow: 'var(--shadow, 0 8px 32px rgba(0,0,0,0.15))'
        }}>
          {[
            { key: 'day', label: 'Jour', icon: 'bi-sun-fill' },
            { key: 'night', label: 'Nuit', icon: 'bi-moon-fill' },
            { key: 'storm', label: 'Orage', icon: 'bi-lightning-fill' }
          ].map(v => (
            <button
              key={v.key}
              onClick={() => handleManual(v.key)}
              style={{
                background: mode === v.key ? 'var(--safe, #1fbc34)' : 'transparent',
                border: `1px solid ${mode === v.key ? 'var(--safe, #1fbc34)' : 'var(--border, #87ADC6)'}`,
                color: mode === v.key ? '#fff' : 'var(--text-primary, #203038)',
                padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all 0.3s'
              }}
            >
              <i className={`bi ${v.icon}`} /> {v.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}