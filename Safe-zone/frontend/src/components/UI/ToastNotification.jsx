// src/components/UI/ToastNotification.jsx
import { useState, useEffect, useCallback } from 'react'

// Context interne simple (sans dépendance externe)
let toastListeners = []
let toastQueue = []

export function addToast(title, message, type = 'info') {
  const id = Date.now() + Math.random()
  const toast = { id, title, message, type }
  toastQueue = [...toastQueue, toast]
  toastListeners.forEach(fn => fn([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    toastListeners.forEach(fn => fn([...toastQueue]))
  }, 5000)
  return id
}

export function removeToast(id) {
  toastQueue = toastQueue.filter(t => t.id !== id)
  toastListeners.forEach(fn => fn([...toastQueue]))
}

const ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
  danger: 'bi-exclamation-octagon-fill'
}

const COLORS = {
  success: '#1fbc34',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#2c7da0',
  danger: '#e74c3c'
}

export default function ToastNotification() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (list) => setToasts([...list])
    toastListeners.push(listener)
    return () => { toastListeners = toastListeners.filter(l => l !== listener) }
  }, [])

  if (!toasts.length) return null

  return (
    <div style={{
      position: 'fixed', top: 80, right: 18, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 340, width: '90%', pointerEvents: 'none'
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'var(--bg-card, #fff)',
            backdropFilter: 'blur(20px)',
            border: `1px solid var(--border, #87ADC6)`,
            borderLeft: `4px solid ${COLORS[t.type] || COLORS.info}`,
            borderRadius: 12,
            padding: '13px 16px',
            boxShadow: 'var(--shadow, 0 8px 32px rgba(0,0,0,0.15))',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 11,
            pointerEvents: 'all',
            animation: 'toastSlideIn 0.4s ease'
          }}
        >
          <i
            className={`bi ${ICONS[t.type] || ICONS.info}`}
            style={{ fontSize: '1.2rem', color: COLORS[t.type] || COLORS.info, flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary, #203038)', marginBottom: 3 }}>
              {t.title}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #578098)' }}>
              {t.message}
            </div>
            <div style={{
              height: 3,
              background: COLORS[t.type] || COLORS.info,
              borderRadius: 2,
              marginTop: 7,
              animation: 'toastBar 5s linear forwards'
            }} />
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none', border: 'none',
              color: 'var(--text-secondary, #578098)',
              cursor: 'pointer', fontSize: '1rem', padding: 2,
              lineHeight: 1
            }}
          >
            <i className="bi bi-x" />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}