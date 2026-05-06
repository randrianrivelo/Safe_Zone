// src/components/UI/ToastNotification.jsx
import { useToast } from '../../context/ToastContext'

const ICONS = {
  success: 'bi-check-circle-fill',
  error: 'bi-x-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  info: 'bi-info-circle-fill',
  danger: 'bi-exclamation-octagon-fill'
}

const COLORS = {
  success: 'var(--safe)',
  error: 'var(--danger)',
  warning: 'var(--warning)',
  info: 'var(--primary)',
  danger: 'var(--danger)'
}

export default function ToastNotification() {
  const { toasts, removeToast } = useToast()

  if (!toasts?.length) return null

  return (
    <div style={{
      position: 'fixed', top: 80, right: 18, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      maxWidth: 340, width: '90%'
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
            border: `1px solid var(--border)`,
            borderLeft: `4px solid ${COLORS[t.type] || COLORS.info}`,
            borderRadius: 12, padding: '13px 16px',
            boxShadow: 'var(--shadow)',
            display: 'flex', alignItems: 'flex-start', gap: 11,
            animation: 'toastIn 0.4s ease'
          }}
        >
          <i
            className={`bi ${ICONS[t.type] || ICONS.info}`}
            style={{ fontSize: '1.25rem', color: COLORS[t.type] || COLORS.info, flexShrink: 0 }}
          ></i>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: 3 }}>
              {t.title}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              {t.message}
            </div>
            {/* Barre de progression */}
            <div style={{
              height: 3, background: COLORS[t.type] || COLORS.info,
              borderRadius: 2, marginTop: 7,
              animation: 'toastProgress 5s linear forwards'
            }} />
          </div>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', padding: 2 }}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      ))}
    </div>
  )
}