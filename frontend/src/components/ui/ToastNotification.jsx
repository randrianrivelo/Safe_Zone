import { useState, useEffect } from 'react'
import './ToastNotification.css'

export default function ToastNotification({ alert, onClose }) {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const duration = 5000

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        setVisible(false)
        setTimeout(onClose, 300)
      }
    }, 50)

    return () => clearInterval(interval)
  }, [onClose])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critique': return 'bi-exclamation-triangle-fill'
      case 'eleve': return 'bi-exclamation-circle-fill'
      case 'moyen': return 'bi-info-circle-fill'
      default: return 'bi-check-circle-fill'
    }
  }

  if (!visible) return null

  return (
    <div
      className="toast-notification"
      style={{
        borderLeftColor: getSeverityColor(alert.severity),
        animation: 'slideInRight 0.3s ease'
      }}
      onClick={() => {
        setVisible(false)
        setTimeout(onClose, 300)
      }}
    >
      <div className="toast-notification__icon">
        <i className={getSeverityIcon(alert.severity)} style={{ color: getSeverityColor(alert.severity) }} />
      </div>
      <div className="toast-notification__content">
        <strong>{alert.title}</strong>
        <p>{alert.message}</p>
      </div>
      <button
        className="toast-notification__close"
        onClick={(e) => {
          e.stopPropagation()
          setVisible(false)
          setTimeout(onClose, 300)
        }}
      >
        <i className="bi bi-x-lg" />
      </button>
      <div className="toast-notification__progress" style={{ width: `${progress}%` }} />
    </div>
  )
}