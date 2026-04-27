// src/pages/AlertsPage.jsx
import { useState, useEffect } from 'react'
import { zoneService } from '../services/api'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([])
  const [dangerZones, setDangerZones] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [alertsRes, zonesRes] = await Promise.all([
          zoneService.getAlerts(),
          zoneService.getDangerZones()
        ])
        setAlerts(alertsRes.data)
        setDangerZones(zonesRes.data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const severityIcon = {
    critical: 'bi-exclamation-octagon-fill text-danger',
    warning: 'bi-exclamation-triangle-fill text-warning',
    info: 'bi-info-circle-fill text-primary'
  }

  const severityBorder = {
    critical: 'border-danger',
    warning: 'border-warning',
    info: 'border-primary'
  }

  return (
    <div className="admin-page" style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <h1 className="mb-4">
        <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
        Alertes & Zones Dangereuses
      </h1>

      {/* ALERTES */}
      <div className="admin-card p-4 mb-4">
        <h3 className="mb-3">
          <i className="bi bi-bell-fill me-2"></i>Alertes Actives
        </h3>

        {alerts.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
            <p className="mt-2">Aucune alerte active</p>
          </div>
        ) : (
          <div className="row g-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="col-md-6">
                <div className={`card border-start border-4 ${severityBorder[alert.severity] || ''}`}>
                  <div className="card-body">
                    <h5 className="card-title d-flex align-items-center gap-2">
                      <i className={severityIcon[alert.severity] || 'bi-info-circle'}></i>
                      {alert.title}
                    </h5>
                    <p className="card-text text-muted">{alert.message}</p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-secondary">{alert.alert_type}</span>
                      <span
                        className={`badge ${
                          alert.severity === 'critical'
                            ? 'bg-danger'
                            : alert.severity === 'warning'
                            ? 'bg-warning text-dark'
                            : 'bg-info'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ZONES DANGEREUSES */}
      <div className="admin-card p-4">
        <h3 className="mb-3">
          <i className="bi bi-radioactive me-2 text-danger"></i>Zones Dangereuses
        </h3>

        {dangerZones.length === 0 ? (
          <p className="text-muted">Aucune zone dangereuse signalée</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>
                    <i className="bi bi-hash me-1"></i>ID
                  </th>
                  <th>
                    <i className="bi bi-tag me-1"></i>Nom
                  </th>
                  <th>
                    <i className="bi bi-exclamation-diamond me-1"></i>Type
                  </th>
                  <th>
                    <i className="bi bi-bullseye me-1"></i>Rayon
                  </th>
                  <th>
                    <i className="bi bi-speedometer me-1"></i>Sévérité
                  </th>
                  <th>
                    <i className="bi bi-toggle-on me-1"></i>Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {dangerZones.map((zone) => (
                  <tr key={zone.id}>
                    <td>{zone.id}</td>
                    <td className="fw-bold">{zone.name}</td>
                    <td>
                      <span className="badge bg-danger">{zone.danger_type}</span>
                    </td>
                    <td>{zone.radius}m</td>
                    <td>
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`bi bi-circle-fill me-1 ${
                            i < zone.severity ? 'text-danger' : 'text-light'
                          }`}
                          style={{ fontSize: '0.6rem' }}
                        ></i>
                      ))}
                    </td>
                    <td>
                      {zone.is_active ? (
                        <span className="badge bg-danger">
                          <i className="bi bi-broadcast me-1"></i>Actif
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Inactif</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}