import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'  // ← AJOUTER
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'
import './AdminStats.css'

export default function AdminStats() {
  const { theme } = useThemeStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [shelters, setShelters] = useState([])
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const [statsRes, sheltersRes] = await Promise.all([
        fetch('http://localhost:8000/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:8000/api/shelters/')
      ])
      setStats(await statsRes.json())
      setShelters(await sheltersRes.json())
    } catch {
      setStats(null)
      setShelters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = setTimeout(() => {
      loadData()
    }, 0)
    return () => clearTimeout(timer)
  }, [theme])

  const top10 = [...shelters]
    .sort((a, b) => b.current_occupancy - a.current_occupancy)
    .slice(0, 10)

  const byType = shelters.reduce((acc, s) => {
    acc[s.shelter_type] = (acc[s.shelter_type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-bar-chart" /> {fr ? 'Statistiques' : 'Isa'}</h1>
          <button className="admin-page__refresh" onClick={loadData}>
            <i className="bi bi-arrow-clockwise" /> {fr ? 'Actualiser' : 'Havaozina'}
          </button>
        </div>

        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : (
          <>
            {/* KPIs */}
            <div className="stats__kpis">
              {[
                { icon: 'bi-building',    val: stats?.total_shelters,  label: fr ? 'Total refuges' : 'Toerana rehetra', color: 'var(--accent)' },
                { icon: 'bi-people-fill', val: stats?.total_capacity?.toLocaleString('fr-FR'),  label: fr ? 'Capacité totale' : 'Haben\'ny rehetra', color: 'var(--cyan)' },
                { icon: 'bi-person-fill', val: stats?.total_occupancy, label: fr ? 'Personnes abritées' : 'Olona voaaro', color: '#39ff88' },
                { icon: 'bi-percent',     val: stats?.total_capacity > 0 ? `${Math.round((stats.total_occupancy / stats.total_capacity) * 100)}%` : '0%', label: fr ? 'Taux occupation' : 'Habeny fampiasana', color: '#ff9500' }
              ].map((k, i) => (
                <div key={i} className="stats__kpi">
                  <i className={k.icon} style={{ color: k.color }} />
                  <span className="stats__kpi-val" style={{ color: k.color }}>{k.val || 0}</span>
                  <span className="stats__kpi-label">{k.label}</span>
                </div>
              ))}
            </div>

            {/* Top 10 refuges */}
            <div className="stats__section">
              <h2><i className="bi bi-trophy" /> {fr ? 'Top 10 refuges les plus occupés' : 'Top 10 toerana feno indrindra'}</h2>
              <div className="stats__bar-chart">
                {top10.map((s, i) => {
                  const pct = s.capacity_total ? Math.round((s.current_occupancy / s.capacity_total) * 100) : 0
                  const clr = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
                  return (
                    <div key={i} className="stats__bar-row">
                      <span className="stats__bar-name">{s.name}</span>
                      <div className="stats__bar-track">
                        <div className="stats__bar-fill"
                          style={{ width: `${pct}%`, background: clr }} />
                      </div>
                      <span className="stats__bar-val" style={{ color: clr }}>
                        {pct}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Par type */}
            <div className="stats__section">
              <h2><i className="bi bi-pie-chart" /> {fr ? 'Refuges par type' : 'Toerana araka ny karazana'}</h2>
              <div className="stats__type-grid">
                {Object.entries(byType).map(([type, count], i) => (
                  <div key={i} className="stats__type-card">
                    <i className="bi bi-building" />
                    <strong>{count}</strong>
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Autres stats */}
            <div className="stats__section">
              <h2><i className="bi bi-info-circle" /> {fr ? 'Résumé opérationnel' : 'Famintinana'}</h2>
              <div className="stats__summary">
                {[
                  { label: fr ? 'Refuges ouverts'     : 'Toerana misokatra',   val: stats?.open_shelters,   color: '#39ff88' },
                  { label: fr ? 'Routes bloquées'     : 'Lalana voasakana',    val: stats?.blocked_roads,   color: '#ff3b30' },
                  { label: fr ? 'Alertes actives'     : 'Fampitandremana',     val: stats?.active_alerts,   color: '#ff9500' },
                  { label: fr ? 'Zones dangereuses'   : 'Faritra mampidi-doza',val: stats?.active_dangers,  color: '#ff3b30' },
                  { label: fr ? 'Signalements attente': 'Miandry hamarina',    val: stats?.pending_reports, color: '#ffd60a' },
                  { label: fr ? 'Places disponibles'  : 'Toerana misy',        val: stats?.available_spots?.toLocaleString('fr-FR'), color: '#39ff88' }
                ].map((s, i) => (
                  <div key={i} className="stats__summary-item">
                    <span>{s.label}</span>
                    <strong style={{ color: s.color }}>{s.val ?? 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}