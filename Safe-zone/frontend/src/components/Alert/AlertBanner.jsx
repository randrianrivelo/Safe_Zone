import { useState, useEffect } from 'react'
import { zoneService } from '../../services/api'

export default function AlertBanner() {
  const [alerts, setAlerts] = useState([])
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    const load = async () => {
      const res = await zoneService.getAlerts()
      setAlerts(res.data)
    }
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const active = alerts.filter(a => !dismissed.includes(a.id))
  if (active.length === 0) return null

  return (
    <div>
      {active.map(alert => (
        <div key={alert.id} className={`alert-banner ${alert.severity || 'warning'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '1.1rem' }}></i>
            <div>
              <strong>{alert.title}</strong>
              <span className="d-none d-md-inline" style={{ marginLeft: 10 }}>{alert.message}</span>
            </div>
          </div>
          <button onClick={() => setDismissed([...dismissed, alert.id])}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      ))}
    </div>
  )
}