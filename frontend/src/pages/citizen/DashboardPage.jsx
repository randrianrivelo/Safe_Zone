import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'  // ← Correction: ajout de "from"
import { shelterService } from '../../services/shelterService'
import { alertService } from '../../services/alertService'
import Navbar from '../../components/layout/Navbar'
import MiniMap from '../../components/map/MiniMap'
import './DashboardPage.css'

function useCountUp(target, duration = 1500, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, start])
  return count
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()  // ← Correction: destructuring correct
  const [stats, setStats] = useState({ total: 0, capacity: 0, alerts: 0, dangers: 0 })
  const [alerts, setAlerts] = useState([])
  const [shelters, setShelters] = useState([])
  const [visible, setVisible] = useState(false)
  const statsRef = useRef(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  const c1 = useCountUp(stats.total, 1500, visible)
  const c2 = useCountUp(stats.capacity, 2000, visible)
  const c3 = useCountUp(stats.alerts, 1200, visible)
  const c4 = useCountUp(stats.dangers, 1200, visible)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')

    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)

    loadData()

    return () => { observer.disconnect() }
  }, [theme])

  const loadData = async () => {
    try {
      const [shelterData, alertData] = await Promise.all([
        shelterService.getAll(),
        alertService.getActive()
      ])
      setShelters(shelterData.slice(0, 4))
      setAlerts(alertData)
      const totalCap = shelterData.reduce((s, r) => s + (r.capacity_total || 0), 0)
      setStats({
        total: shelterData.length,
        capacity: totalCap,
        alerts: alertData.length,
        dangers: 6
      })
    } catch (err) {
      console.error('Erreur chargement données:', err)
      setStats({ total: 88, capacity: 70755, alerts: 3, dangers: 6 })
    }
  }

  const severityIcon = (sev) => {
    const map = {
      critique: { icon: 'bi-exclamation-triangle-fill', color: '#ff3b30' },
      eleve: { icon: 'bi-exclamation-circle-fill', color: '#ff9500' },
      moyen: { icon: 'bi-info-circle-fill', color: '#ffd60a' },
      faible: { icon: 'bi-check-circle-fill', color: '#39ff88' }
    }
    return map[sev] || map.moyen
  }

  const getOccupancyColor = (current, total) => {
    if (!total) return '#94a3b8'
    const pct = (current / total) * 100
    if (pct >= 90) return '#ff3b30'
    if (pct >= 50) return '#ff9500'
    return '#39ff88'
  }

  const getOccupancyPercent = (current, total) => {
    if (!total) return 0
    return Math.round((current / total) * 100)
  }

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard__main">

        {/* BIENVENUE */}
        <section className="dashboard__welcome">
          <div>
            <h1 className="dashboard__welcome-title">
              {fr ? 'Bonjour' : 'Manahoana'}, {user?.name || 'Utilisateur'} !
            </h1>
            <p className="dashboard__welcome-sub">
              {fr
                ? 'Bienvenue sur Smart SafeZone Analamanga 2035'
                : 'Tongasoa eto amin\'ny Smart SafeZone Analamanga 2035'}
            </p>
          </div>
          <button className="dashboard__emergency-btn" onClick={() => navigate('/emergency')}>
            <i className="bi bi-lightning-charge-fill" />
            {fr ? 'URGENCE' : 'MAIKA'}
          </button>
        </section>

        {/* STATS */}
        <section className="dashboard__stats" ref={statsRef}>
          {[
            { icon: 'bi-building', val: c1, label: fr ? 'Refuges' : 'Toerana', color: 'var(--accent)' },
            { icon: 'bi-people-fill', val: c2.toLocaleString('fr-FR'), label: fr ? 'Places disponibles' : 'Toerana misy', color: 'var(--cyan)' },
            { icon: 'bi-exclamation-triangle', val: c3, label: fr ? 'Alertes actives' : 'Fampitandremana', color: '#ff9500' },
            { icon: 'bi-radioactive', val: c4, label: fr ? 'Zones à risque' : 'Toerana mampidi-doza', color: '#ff3b30' }
          ].map((s, i) => (
            <div key={i} className="dashboard__stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="dashboard__stat-icon" style={{ background: `${s.color}15`, borderColor: `${s.color}30` }}>
                <i className={s.icon} style={{ color: s.color }} />
              </div>
              <span className="dashboard__stat-val" style={{ color: s.color }}>{s.val}</span>
              <span className="dashboard__stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* CARTE */}
        <section className="dashboard__map-section">
          <div className="dashboard__map-header">
            <h2><i className="bi bi-map" /> {fr ? 'Carte interactive' : 'Sarintany'}</h2>
            <button className="dashboard__map-expand" onClick={() => navigate('/map')}>
              <i className="bi bi-arrows-fullscreen" /> {fr ? 'Plein écran' : 'Feno'}
            </button>
          </div>
          <div className="dashboard__map-wrap">
            <MiniMap />
          </div>
        </section>

        {/* ALERTES + ACTIONS */}
        <section className="dashboard__bottom">

          {/* Alertes */}
          <div className="dashboard__alerts-panel">
            <h3 className="dashboard__panel-title">
              <i className="bi bi-bell" />
              {fr ? 'Alertes actives' : 'Fampitandremana'}
              <span className="dashboard__panel-badge">{alerts.length || 3}</span>
            </h3>
            <div className="dashboard__alerts-list">
              {(alerts.length > 0 ? alerts : [
                { title: 'Alerte cyclone GAMANE', severity: 'critique', created_at: new Date().toISOString() },
                { title: 'Inondation Sisaony', severity: 'eleve', created_at: new Date().toISOString() },
                { title: 'RN2 partiellement coupée', severity: 'moyen', created_at: new Date().toISOString() }
              ]).map((a, i) => {
                const sev = severityIcon(a.severity)
                return (
                  <div key={i} className="dashboard__alert-item">
                    <i className={sev.icon} style={{ color: sev.color }} />
                    <div className="dashboard__alert-info">
                      <strong>{a.title}</strong>
                      <span>{fr ? 'Il y a quelques heures' : 'Ora vitsy lasa'}</span>
                    </div>
                    <span className="dashboard__alert-severity"
                          style={{ background: `${sev.color}15`, color: sev.color, border: `1px solid ${sev.color}30` }}>
                      {a.severity}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="dashboard__actions-panel">
            <h3 className="dashboard__panel-title">
              <i className="bi bi-lightning-charge" />
              {fr ? 'Actions rapides' : 'Hetsika haingana'}
            </h3>
            <div className="dashboard__actions-list">
              {[
                { icon: 'bi-sign-turn-right', label: fr ? 'Trouver refuge le plus proche' : 'Mitady toerana akaiky', color: 'var(--accent)', path: '/map' },
                { icon: 'bi-lightning-charge-fill', label: fr ? 'Mode urgence' : 'Fomba maika', color: '#ff3b30', path: '/emergency' },
                { icon: 'bi-camera-fill', label: fr ? 'Signaler un danger' : 'Mampandre loza', color: '#ff9500', path: '/report' },
                { icon: 'bi-clock-history', label: fr ? 'Voir mon historique' : 'Hijery tantara', color: 'var(--cyan)', path: '/history' },
                { icon: 'bi-gear', label: fr ? 'Paramètres' : 'Fitamboatra', color: 'var(--text-muted)', path: '/user/settings' }
              ].map((a, i) => (
                <button key={i} className="dashboard__action-btn" onClick={() => navigate(a.path)}>
                  <div className="dashboard__action-icon" style={{ background: `${a.color}12`, borderColor: `${a.color}25` }}>
                    <i className={a.icon} style={{ color: a.color }} />
                  </div>
                  <span>{a.label}</span>
                  <i className="bi bi-chevron-right" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* REFUGES PROCHES */}
        <section className="dashboard__nearby">
          <div className="dashboard__nearby-header">
            <h3><i className="bi bi-geo-alt" /> {fr ? 'Refuges proches' : 'Toerana akaiky'}</h3>
            <button className="dashboard__see-all" onClick={() => navigate('/map')}>
              {fr ? 'Voir tout' : 'Hijery rehetra'} <i className="bi bi-arrow-right" />
            </button>
          </div>
          <div className="dashboard__nearby-grid">
            {(shelters.length > 0 ? shelters : [
              { id: 1, name: 'Stade Mahamasina', current_occupancy: 450, capacity_total: 3000 },
              { id: 5, name: 'Palais des Sports', current_occupancy: 200, capacity_total: 2000 },
              { id: 44, name: 'Campus Ankatso', current_occupancy: 100, capacity_total: 4000 },
              { id: 9, name: 'Centre Anosizato', current_occupancy: 800, capacity_total: 2485 }
            ]).map((s, i) => {
              const pct = getOccupancyPercent(s.current_occupancy, s.capacity_total)
              const clr = getOccupancyColor(s.current_occupancy, s.capacity_total)
              return (
                <div key={i} className="dashboard__shelter-card">
                  <div className="dashboard__shelter-icon"><i className="bi bi-building" /></div>
                  <strong className="dashboard__shelter-name">{s.name}</strong>
                  <div className="dashboard__shelter-bar-wrap">
                    <div className="dashboard__shelter-bar" style={{ width: `${pct}%`, background: clr }} />
                  </div>
                  <span className="dashboard__shelter-cap" style={{ color: clr }}>
                    {s.current_occupancy}/{s.capacity_total} ({pct}%)
                  </span>
                  <button className="dashboard__shelter-btn" onClick={() => navigate('/map')}>
                    <i className="bi bi-sign-turn-right" /> {fr ? 'Itinéraire' : 'Lalana'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}