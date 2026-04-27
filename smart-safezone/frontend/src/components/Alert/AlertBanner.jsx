// src/components/Alert/AlertBanner.jsx
import { useState, useEffect } from 'react'
import { zoneService } from '../../services/api'

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await zoneService.getAlerts()
        setAlerts(res.data)
      } catch (err) {
        console.error('Erreur chargement alertes:', err)
      }
    }
    loadAlerts()
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const dismiss = (id) => {
    setDismissed((prev) => [...prev, id])
  }

  const activeAlerts = alerts.filter((a) => !dismissed.includes(a.id))

  if (activeAlerts.length === 0) return null

  return (
    <div>
      {activeAlerts.map((alert) => (
        <div key={alert.id} className={`alert-banner ${alert.severity || 'warning'}`}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>
              <strong>{alert.title}</strong>
              <span className="ms-2 d-none d-md-inline">{alert.message}</span>
            </div>
          </div>
          <button
            className="btn btn-sm p-1 border-0"
            onClick={() => dismiss(alert.id)}
            style={{ background: 'transparent' }}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ))}
    </div>
  )
}