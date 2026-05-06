import { useState, useEffect } from 'react'
import { zoneService } from '../services/api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [zones, setZones] = useState([])

  useEffect(() => {
    const load = async () => {
      const [a, z] = await Promise.all([zoneService.getAlerts(), zoneService.getDanger()])
      setAlerts(a.data)
      setZones(z.data)
    }
    load()
  }, [])

  const icon = { critical: 'bi-exclamation-octagon-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-info-circle-fill' }
  const color = { critical: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' }

  return (
    <div className="alerts-page" style={{ paddingTop: 24, overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="bi bi-exclamation-triangle-fill" style={{ color: 'var(--warning)' }}></i> Alertes & Zones
      </h1>

      <div className="glass-card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}><i className="bi bi-bell-fill" style={{ marginRight: 8 }}></i>Alertes Actives</h3>
        {alerts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Aucune alerte active</p>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {alerts.map(a => (
              <div key={a.id} className="glass" style={{ padding: 16, borderLeft: `4px solid ${color[a.severity] || 'var(--primary)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <i className={`bi ${icon[a.severity] || 'bi-info-circle'}`} style={{ color: color[a.severity], fontSize: '1.1rem' }}></i>
                  <strong>{a.title}</strong>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>{a.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}><i className="bi bi-radioactive" style={{ marginRight: 8, color: 'var(--danger)' }}></i>Zones Dangereuses</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Rayon</th>
                <th>Severite</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {zones.map(z => (
                <tr key={z.id}>
                  <td style={{ fontWeight: 600 }}>{z.name}</td>
                  <td><span className="status-pill" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>{z.danger_type}</span></td>
                  <td>{z.radius}m</td>
                  <td>
                    <div className="severity-dots">
                      {[1,2,3,4,5].map(i => <div key={i} className={`dot ${i <= z.severity ? 'filled' : 'empty'}`}></div>)}
                    </div>
                  </td>
                  <td>{z.is_active ? <span className="status-pill" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Actif</span> : <span className="status-pill">Inactif</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}