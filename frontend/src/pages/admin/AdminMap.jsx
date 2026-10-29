import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import Navbar from '../../components/layout/Navbar'
import { shelterService } from '../../services/shelterService'
import { alertService } from '../../services/alertService'
import 'leaflet/dist/leaflet.css'
import './AdminMap.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({
  iconUrl, shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41]
})

const CENTER = [-18.9070, 47.5350]

// Zones dangereuses (Analamanga)
const DANGERS = [
  { name: 'Plaine Sisaony', lat: -18.9750, lon: 47.4950, radius: 3500, severity: 'critique', color: '#ff3b30' },
  { name: 'Berges Ikopa', lat: -18.9600, lon: 47.4870, radius: 2800, severity: 'eleve', color: '#ff9500' },
  { name: 'Bas-fond Mamba', lat: -18.9820, lon: 47.5080, radius: 2000, severity: 'eleve', color: '#ff9500' },
  { name: 'Isotry', lat: -18.9300, lon: 47.5200, radius: 1500, severity: 'eleve', color: '#ff9500' },
  { name: 'Plaine Tongoloina', lat: -18.9450, lon: 47.5350, radius: 2500, severity: 'critique', color: '#ff3b30' }
]

// Récupérer le token correctement
const getAuthToken = () => {
  let token = localStorage.getItem('token')
  if (!token) return null
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1)
  }
  if (typeof token === 'object' && token.access_token) {
    return token.access_token
  }
  return token
}

export default function AdminMap() {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const [shelters, setShelters] = useState([])
  const [alerts, setAlerts] = useState([])
  const [showPanel, setShowPanel] = useState(true)
  const [layers, setLayers] = useState({ shelters: true, dangers: true, alerts: true })
  const [activeTab, setActiveTab] = useState('affluence')
  const [sendingAlert, setSendingAlert] = useState(false)
  const [alertMsg, setAlertMsg] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertSeverity, setAlertSeverity] = useState('critique')
  const [alertType, setAlertType] = useState('urgence')
  const [targetDistrict, setTargetDistrict] = useState('')
  const [loading, setLoading] = useState(true)
  const [successMsg, setSuccessMsg] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  // Charger les données
  const loadData = async () => {
    setLoading(true)
    try {
      const [sheltersData, alertsData] = await Promise.all([
        shelterService.getAll(),
        alertService.getActive().catch(() => [])
      ])
      setShelters(Array.isArray(sheltersData) ? sheltersData : [])
      setAlerts(Array.isArray(alertsData) ? alertsData : [])
    } catch (err) {
      console.error('Erreur chargement:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadData()

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [theme])

  // Envoyer une alerte massive
  const sendMassAlert = async () => {
    if (!alertMsg.trim()) {
      alert(fr ? 'Veuillez saisir un message' : 'Ampidiro hafatra')
      return
    }

    if (!alertTitle.trim()) {
      alert(fr ? 'Veuillez saisir un titre' : 'Ampidiro lohateny')
      return
    }

    const token = getAuthToken()
    if (!token) {
      alert(fr ? 'Vous devez être connecté en tant qu\'admin' : 'Mila mampiditra admin')
      return
    }

    setSendingAlert(true)
    setSuccessMsg('')

    try {
      const alertData = {
        title: alertTitle,
        message: alertMsg,
        alert_type: alertType,
        severity: alertSeverity,
        target_district: targetDistrict || null
      }

      console.log('Envoi alerte:', alertData)

      const response = await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(alertData)
      })

      if (response.ok) {
        const newAlert = await response.json()
        setSuccessMsg(fr ? '✅ Alerte envoyée avec succès !' : '✅ Fampitandremana nalefa soa aman-tsara !')
        setAlertMsg('')
        setAlertTitle('')
        setTargetDistrict('')
        // Recharger les alertes
        await loadData()

        // Effacer le message après 3 secondes
        setTimeout(() => setSuccessMsg(''), 3000)
      } else if (response.status === 401) {
        alert(fr ? 'Session expirée - Veuillez vous reconnecter' : 'Lasa ny session - Midira indray')
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Erreur envoi')
      }
    } catch (err) {
      console.error('Erreur envoi alerte:', err)
      alert(fr ? 'Erreur lors de l\'envoi : ' + err.message : 'Olana tamin\'ny fandefasana : ' + err.message)
    } finally {
      setSendingAlert(false)
    }
  }

  const shelterIcon = (s) => {
    const pct = s.capacity_total ? (s.current_occupancy / s.capacity_total) * 100 : 0
    const color = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
    return L.divIcon({
      className: '',
      html: `<div style="
        width: 12px; height: 12px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid ${theme === 'dark' ? '#0b1023' : '#ffffff'};
        box-shadow: 0 0 8px ${color};
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
  }

  const tileKey = theme === 'dark' ? 'dark' : 'light'
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const top5 = [...shelters].sort((a, b) => b.current_occupancy - a.current_occupancy).slice(0, 5)

  const stats = {
    total: shelters.length,
    open: shelters.filter(s => s.status === 'ouvert').length,
    saturated: shelters.filter(s => s.status === 'sature').length,
    totalCapacity: shelters.reduce((sum, s) => sum + (s.capacity_total || 0), 0),
    totalOccupancy: shelters.reduce((sum, s) => sum + (s.current_occupancy || 0), 0)
  }

  // Options pour la sévérité
  const severityOptions = [
    { value: 'faible', label: fr ? 'Faible' : 'Kely', color: '#39ff88' },
    { value: 'moyen', label: fr ? 'Moyen' : 'Antonony', color: '#ffd60a' },
    { value: 'eleve', label: fr ? 'Élevé' : 'Avo', color: '#ff9500' },
    { value: 'critique', label: fr ? 'Critique' : 'Goavana', color: '#ff3b30' }
  ]

  const typeOptions = [
    { value: 'info', label: fr ? 'Information' : 'Fampahalalana' },
    { value: 'avertissement', label: fr ? 'Avertissement' : 'Fampitandremana' },
    { value: 'urgence', label: fr ? 'Urgence' : 'Maika' },
    { value: 'critique', label: fr ? 'Critique' : 'Goavana' }
  ]

  // Districts d'Analamanga
  const districts = [
    { id: '', name: fr ? 'Tous les districts' : 'Distrika rehetra' },
    { id: 'Antananarivo Renivohitra', name: 'Antananarivo Renivohitra' },
    { id: 'Antananarivo Atsimondrano', name: 'Antananarivo Atsimondrano' },
    { id: 'Antananarivo Avaradrano', name: 'Antananarivo Avaradrano' },
    { id: 'Ambohidratrimo', name: 'Ambohidratrimo' },
    { id: 'Manjakandriana', name: 'Manjakandriana' },
    { id: 'Andramasina', name: 'Andramasina' },
    { id: 'Anjozorobe', name: 'Anjozorobe' },
    { id: 'Ankazobe', name: 'Ankazobe' },
    { id: 'Arivonimamo', name: 'Arivonimamo' },
    { id: 'Ambatolampy', name: 'Ambatolampy' }
  ]

  if (loading) {
    return (
      <div className="admin-map">
        <Navbar />
        <div className="admin-map__loading">
          <div className="spinner-lg"></div>
          <p>{fr ? 'Chargement de la carte...' : 'Mampiditra ny sarintany...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-map">
      <Navbar />
      <div className="admin-map__container">

        <div className={`admin-map__panel ${showPanel ? '' : 'admin-map__panel--hidden'}`}>

          {/* Stats mini */}
          <div className="admin-map__stats-mini">
            <div className="admin-map__stat-mini">
              <span className="admin-map__stat-mini-val">{stats.total}</span>
              <span className="admin-map__stat-mini-label">{fr ? 'Refuges' : 'Toerana'}</span>
            </div>
            <div className="admin-map__stat-mini">
              <span className="admin-map__stat-mini-val" style={{ color: '#39ff88' }}>{stats.open}</span>
              <span className="admin-map__stat-mini-label">{fr ? 'Ouverts' : 'Misokatra'}</span>
            </div>
            <div className="admin-map__stat-mini">
              <span className="admin-map__stat-mini-val" style={{ color: '#ff3b30' }}>{stats.saturated}</span>
              <span className="admin-map__stat-mini-label">{fr ? 'Saturés' : 'Feno'}</span>
            </div>
            <div className="admin-map__stat-mini">
              <span className="admin-map__stat-mini-val">{Math.round((stats.totalOccupancy / stats.totalCapacity) * 100) || 0}%</span>
              <span className="admin-map__stat-mini-label">{fr ? 'Occupation' : 'Feno'}</span>
            </div>
          </div>

          {/* Onglets */}
          <div className="admin-map__tabs">
            <button
              className={`admin-map__tab ${activeTab === 'affluence' ? 'active' : ''}`}
              onClick={() => setActiveTab('affluence')}
            >
              <i className="bi bi-graph-up"></i> {fr ? 'Affluence' : 'Famatsiana'}
            </button>
            <button
              className={`admin-map__tab ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <i className="bi bi-megaphone"></i> {fr ? 'Alertes' : 'Fampitandremana'}
            </button>
            <button
              className={`admin-map__tab ${activeTab === 'layers' ? 'active' : ''}`}
              onClick={() => setActiveTab('layers')}
            >
              <i className="bi bi-layers"></i> {fr ? 'Couches' : 'Sosona'}
            </button>
          </div>

          {/* Onglet Affluence */}
          {activeTab === 'affluence' && (
            <div className="admin-map__tab-content">
              <h4><i className="bi bi-trophy"></i> {fr ? 'Top refuges' : 'Toerana lehibe'}</h4>
              {top5.map((s, i) => {
                const pct = s.capacity_total ? Math.round((s.current_occupancy / s.capacity_total) * 100) : 0
                const clr = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
                return (
                  <div key={i} className="admin-map__shelter-row">
                    <span className="admin-map__shelter-name" title={s.name}>{s.name}</span>
                    <div className="admin-map__shelter-bar">
                      <div style={{ width: `${pct}%`, background: clr }} />
                    </div>
                    <span style={{ color: clr, fontSize: '0.75rem', fontWeight: 700 }}>{pct}%</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Onglet Alertes - Version complète avec formulaire */}
          {activeTab === 'alerts' && (
            <div className="admin-map__tab-content">
              <div className="admin-map__mass-alert">
                <h4><i className="bi bi-megaphone-fill"></i> {fr ? 'Nouvelle alerte massive' : 'Fampitandremana vaovao'}</h4>

                {successMsg && (
                  <div className="admin-map__success-msg">
                    <i className="bi bi-check-circle-fill"></i> {successMsg}
                  </div>
                )}

                <div className="admin-map__alert-form">
                  <div className="admin-map__form-group">
                    <label>{fr ? 'Titre' : 'Lohateny'}</label>
                    <input
                      type="text"
                      value={alertTitle}
                      onChange={(e) => setAlertTitle(e.target.value)}
                      placeholder={fr ? 'Titre de l\'alerte...' : 'Lohatenin\'ny fampitandremana...'}
                    />
                  </div>

                  <div className="admin-map__form-group">
                    <label>{fr ? 'Message' : 'Hafatra'}</label>
                    <textarea
                      value={alertMsg}
                      onChange={(e) => setAlertMsg(e.target.value)}
                      rows={3}
                      placeholder={fr ? 'Détail de l\'alerte...' : 'Antsipirihan\'ny fampitandremana...'}
                    />
                  </div>

                  <div className="admin-map__form-row">
                    <div className="admin-map__form-group">
                      <label>{fr ? 'Type' : 'Karazana'}</label>
                      <select value={alertType} onChange={(e) => setAlertType(e.target.value)}>
                        {typeOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-map__form-group">
                      <label>{fr ? 'Sévérité' : 'Haben\'ny'}</label>
                      <select
                        value={alertSeverity}
                        onChange={(e) => setAlertSeverity(e.target.value)}
                        style={{
                          borderColor: severityOptions.find(s => s.value === alertSeverity)?.color,
                          backgroundColor: `${severityOptions.find(s => s.value === alertSeverity)?.color}10`
                        }}
                      >
                        {severityOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="admin-map__form-group">
                    <label>{fr ? 'District cible (optionnel)' : 'Distrika tanjona (tsy voatery)'}</label>
                    <select value={targetDistrict} onChange={(e) => setTargetDistrict(e.target.value)}>
                      {districts.map(d => (
                        <option key={d.id || 'all'} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="admin-map__send-btn"
                    onClick={sendMassAlert}
                    disabled={sendingAlert || !alertMsg.trim() || !alertTitle.trim()}
                    style={{
                      background: severityOptions.find(s => s.value === alertSeverity)?.color,
                      opacity: sendingAlert ? 0.7 : 1
                    }}
                  >
                    {sendingAlert ? (
                      <><div className="spinner-sm"></div> {fr ? 'Envoi...' : 'Mandefa...'}</>
                    ) : (
                      <><i className="bi bi-send-fill"></i> {fr ? 'Envoyer l\'alerte' : 'Alefaso ny fampitandremana'}</>
                    )}
                  </button>
                </div>
              </div>

              <h4 className="admin-map__section-title">
                <i className="bi bi-bell-fill"></i> {fr ? 'Alertes actives' : 'Fampitandremana mavitrika'} ({alerts.length})
              </h4>

              {alerts.length === 0 ? (
                <div className="admin-map__empty-alerts">
                  <i className="bi bi-bell-slash"></i>
                  <span>{fr ? 'Aucune alerte active' : 'Tsy misy fampitandremana mavitrika'}</span>
                </div>
              ) : (
                alerts.map((a, i) => {
                  const severity = severityOptions.find(s => s.value === a.severity) || severityOptions[3]
                  return (
                    <div key={i} className="admin-map__alert-item" style={{ borderLeftColor: severity.color }}>
                      <div className="admin-map__alert-icon">
                        <i className="bi bi-exclamation-triangle-fill" style={{ color: severity.color }} />
                      </div>
                      <div className="admin-map__alert-info">
                        <strong>{a.title}</strong>
                        <span>{a.message?.substring(0, 80)}</span>
                        <div className="admin-map__alert-meta">
                          <span className="admin-map__alert-severity" style={{ background: `${severity.color}20`, color: severity.color }}>
                            {severity.label}
                          </span>
                          <span className="admin-map__alert-date">
                            {new Date(a.created_at).toLocaleString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Onglet Couches */}
          {activeTab === 'layers' && (
            <div className="admin-map__tab-content">
              <h4><i className="bi bi-eye"></i> {fr ? 'Couches affichées' : 'Sosona aseho'}</h4>

              <div className="admin-map__layer-toggle">
                <i className="bi bi-building"></i>
                <span>{fr ? 'Refuges' : 'Toerana'}</span>
                <label className="settings__switch">
                  <input
                    type="checkbox"
                    checked={layers.shelters}
                    onChange={() => setLayers({ ...layers, shelters: !layers.shelters })}
                  />
                  <span className="settings__slider" />
                </label>
              </div>

              <div className="admin-map__layer-toggle">
                <i className="bi bi-radioactive"></i>
                <span>{fr ? 'Zones dangereuses' : 'Faritra mampidi-doza'}</span>
                <label className="settings__switch">
                  <input
                    type="checkbox"
                    checked={layers.dangers}
                    onChange={() => setLayers({ ...layers, dangers: !layers.dangers })}
                  />
                  <span className="settings__slider" />
                </label>
              </div>

              <div className="admin-map__layer-toggle">
                <i className="bi bi-bell"></i>
                <span>{fr ? 'Alertes' : 'Fampitandremana'}</span>
                <label className="settings__switch">
                  <input
                    type="checkbox"
                    checked={layers.alerts}
                    onChange={() => setLayers({ ...layers, alerts: !layers.alerts })}
                  />
                  <span className="settings__slider" />
                </label>
              </div>

              <button className="admin-map__refresh-btn" onClick={loadData}>
                <i className="bi bi-arrow-clockwise"></i> {fr ? 'Rafraîchir' : 'Havaozina'}
              </button>
            </div>
          )}
        </div>

        <button className="admin-map__toggle" onClick={() => setShowPanel(!showPanel)}>
          <i className={`bi bi-chevron-${showPanel ? 'left' : 'right'}`} />
        </button>

        <div className="admin-map__map">
          <MapContainer key={`map-${tileKey}`} center={CENTER} zoom={11} style={{ width: '100%', height: '100%' }}>
            <TileLayer key={tileKey} url={tileUrl} attribution='&copy; CARTO' />

            {layers.shelters && shelters.map((s, i) => (
              <Marker key={i} position={[s.latitude, s.longitude]} icon={shelterIcon(s)}>
                <Popup>
                  <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '0.82rem', minWidth: 160 }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>{s.name}</strong>
                    <span style={{ color: '#94a3b8' }}>{s.current_occupancy}/{s.capacity_total}</span>
                    <br />
                    <span style={{
                      fontWeight: 700,
                      color: (s.current_occupancy / s.capacity_total) >= 0.9 ? '#ff3b30' :
                             (s.current_occupancy / s.capacity_total) >= 0.7 ? '#ff9500' :
                             (s.current_occupancy / s.capacity_total) >= 0.5 ? '#ffd60a' : '#39ff88'
                    }}>
                      {Math.round((s.current_occupancy / s.capacity_total) * 100)}% {fr ? 'occupé' : 'feno'}
                    </span>
                    {s.has_water && <span title="Eau"> 💧</span>}
                    {s.has_electricity && <span title="Élec"> ⚡</span>}
                    {s.has_medical && <span title="Med"> 🏥</span>}
                  </div>
                </Popup>
              </Marker>
            ))}

            {layers.dangers && DANGERS.map((z, i) => (
              <Circle
                key={i}
                center={[z.lat, z.lon]}
                radius={z.radius}
                pathOptions={{
                  color: z.color,
                  fillColor: z.color,
                  fillOpacity: 0.12,
                  weight: 1.5,
                  dashArray: '5 5'
                }}
              >
                <Popup>
                  <strong style={{ color: z.color }}>⚠ {z.name}</strong><br />
                  <span>{z.severity}</span>
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
      </div>

      <style jsx>{`
        .admin-map {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .admin-map__container {
          display: flex;
          height: calc(100vh - 60px);
          margin-top: 60px;
          position: relative;
        }

        .admin-map__panel {
          width: 360px;
          min-width: 360px;
          background: var(--sidebar-bg);
          backdrop-filter: blur(24px);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: all 0.35s ease;
          z-index: 10;
          overflow-y: auto;
        }

        .admin-map__panel--hidden {
          margin-left: -360px;
        }

        .admin-map__stats-mini {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          padding: 12px;
          border-bottom: 1px solid var(--border);
        }

        .admin-map__stat-mini {
          text-align: center;
          padding: 8px 4px;
          background: var(--glass-bg);
          border-radius: var(--radius-sm);
        }

        .admin-map__stat-mini-val {
          font-size: 1.2rem;
          font-weight: 800;
          display: block;
          line-height: 1.2;
        }

        .admin-map__stat-mini-label {
          font-size: 0.65rem;
          color: var(--text-secondary);
        }

        .admin-map__toggle {
          position: absolute;
          left: 360px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          width: 28px;
          height: 56px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-left: none;
          border-radius: 0 8px 8px 0;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.35s ease;
        }

        .admin-map__panel--hidden ~ .admin-map__toggle {
          left: 0;
        }

        .admin-map__toggle:hover {
          color: var(--accent);
        }

        .admin-map__tabs {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 0 8px;
          gap: 4px;
        }

        .admin-map__tab {
          flex: 1;
          padding: 10px 6px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: var(--radius-sm);
        }

        .admin-map__tab:hover {
          color: var(--text-primary);
          background: var(--bg-input);
        }

        .admin-map__tab.active {
          color: var(--accent);
          background: var(--accent-light);
          font-weight: 600;
        }

        .admin-map__tab-content {
          padding: 16px;
          overflow-y: auto;
          flex: 1;
        }

        .admin-map__tab-content h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .admin-map__section-title {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
        }

        .admin-map__shelter-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .admin-map__shelter-name {
          font-size: 0.75rem;
          width: 110px;
          min-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: var(--text-primary);
        }

        .admin-map__shelter-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-input);
          border-radius: 3px;
          overflow: hidden;
        }

        .admin-map__shelter-bar > div {
          height: 100%;
          border-radius: 3px;
        }

        .admin-map__mass-alert {
          background: var(--accent-light);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-bottom: 16px;
        }

        .admin-map__mass-alert h4 {
          margin-bottom: 12px;
          color: var(--accent);
        }

        .admin-map__success-msg {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          background: rgba(57, 255, 136, 0.1);
          border-radius: var(--radius-sm);
          color: #39ff88;
          font-size: 0.8rem;
          margin-bottom: 12px;
        }

        .admin-map__alert-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .admin-map__form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-map__form-group label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .admin-map__form-group input,
        .admin-map__form-group textarea,
        .admin-map__form-group select {
          padding: 8px 12px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.8rem;
          font-family: inherit;
        }

        .admin-map__form-group input:focus,
        .admin-map__form-group textarea:focus,
        .admin-map__form-group select:focus {
          outline: none;
          border-color: var(--accent);
        }

        .admin-map__form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .admin-map__send-btn {
          margin-top: 6px;
          padding: 10px;
          border: none;
          border-radius: var(--radius-sm);
          color: white;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .admin-map__send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .admin-map__send-btn:disabled {
          cursor: not-allowed;
        }

        .admin-map__alert-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          margin-bottom: 10px;
          background: var(--glass-bg);
          border-left: 3px solid;
          border-radius: var(--radius-sm);
        }

        .admin-map__alert-icon i {
          font-size: 1.1rem;
        }

        .admin-map__alert-info {
          flex: 1;
        }

        .admin-map__alert-info strong {
          font-size: 0.85rem;
          display: block;
          margin-bottom: 4px;
        }

        .admin-map__alert-info span {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 6px;
        }

        .admin-map__alert-meta {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 4px;
        }

        .admin-map__alert-severity {
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-size: 0.65rem;
          font-weight: 700;
        }

        .admin-map__alert-date {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .admin-map__empty-alerts {
          text-align: center;
          padding: 30px 20px;
          color: var(--text-muted);
        }

        .admin-map__empty-alerts i {
          font-size: 2rem;
          display: block;
          margin-bottom: 10px;
        }

        .admin-map__layer-toggle {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          margin-bottom: 8px;
        }

        .admin-map__layer-toggle i {
          color: var(--accent);
          font-size: 1rem;
        }

        .admin-map__layer-toggle > span {
          flex: 1;
          font-size: 0.85rem;
        }

        .admin-map__refresh-btn {
          width: 100%;
          padding: 10px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 12px;
          transition: all 0.2s ease;
        }

        .admin-map__refresh-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .admin-map__map {
          flex: 1;
          position: relative;
        }

        .admin-map__loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: calc(100vh - 60px);
          gap: 16px;
        }

        .settings__switch {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .settings__switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .settings__slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border);
          border-radius: 24px;
          transition: all 0.2s ease;
        }

        .settings__slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: #ffffff;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .settings__switch input:checked + .settings__slider {
          background: var(--accent);
        }

        .settings__switch input:checked + .settings__slider::before {
          transform: translateX(20px);
        }

        .spinner-sm {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .spinner-lg {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border);
          border-top: 3px solid var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        [data-theme="light"] .admin-map__panel {
          background: rgba(241, 245, 249, 0.97);
        }

        [data-theme="light"] .admin-map__toggle {
          background: #f1f5f9;
          border-color: #dde3ea;
        }

        [data-theme="light"] .admin-map__layer-toggle {
          background: #f8fafc;
          border-color: #dde3ea;
        }

        [data-theme="light"] .admin-map__mass-alert {
          background: rgba(31, 188, 52, 0.08);
        }
      `}</style>
    </div>
  )
}