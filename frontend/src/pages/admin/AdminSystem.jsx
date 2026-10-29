import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminSystem() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function checkStatus() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/admin/status', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const result = await res.json()
      setData(result)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark')

    const timer = setTimeout(() => {
      checkStatus()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const services = [
    { name: 'API FastAPI', icon: 'bi-lightning-charge', ok: data?.database !== undefined, color: '#39ff88' },
    { name: 'PostgreSQL',  icon: 'bi-database',         ok: data?.database,  color: '#38bdf8' },
    { name: 'Redis Cache', icon: 'bi-memory',           ok: data?.redis, color: '#ff9500' }
  ]

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-cpu" /> {fr ? 'Statut système' : 'Sata rafitra'}</h1>
          <button className="admin-page__refresh" onClick={checkStatus} disabled={loading}>
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} /> {fr ? 'Vérifier' : 'Manamarina'}
          </button>
        </div>

        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : (
          <>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
              {services.map((s, i) => (
                <div key={i} className="admin-page__form" style={{ marginBottom:0, textAlign:'center' }}>
                  <i className={s.icon} style={{ fontSize:'2rem', color: s.ok ? '#39ff88' : '#ff3b30', display:'block', marginBottom:8 }} />
                  <strong style={{ display:'block', marginBottom:4 }}>{s.name}</strong>
                  <span style={{ color: s.ok ? '#39ff88' : '#ff3b30', fontWeight:700 }}>
                    {s.ok ? '✅ OK' : '❌ DOWN'}
                  </span>
                </div>
              ))}
            </div>

            <div className="admin-page__form" style={{ marginBottom:0 }}>
              <h3><i className="bi bi-info-circle" /> {fr ? 'Informations système' : 'Fampahalalana rafitra'}</h3>
              <div className="stats__summary">
                {[
                  { label: fr ? 'Version App'      : 'Dikan\'ny App',       val: data?.app_version },
                  { label: fr ? 'Python'            : 'Python',               val: data?.python_version },
                  { label: fr ? 'Base de données'   : 'Database',             val: 'PostgreSQL 14+' },
                  { label: fr ? 'Uptime'            : 'Uptime',               val: data?.uptime },
                  { label: fr ? 'Utilisateurs'      : 'Mpampiasa',            val: data?.counts.users },
                  { label: fr ? 'Refuges'           : 'Refuges',              val: data?.counts.shelters },
                  { label: fr ? 'Signalements'      : 'Signalements',         val: data?.counts.reports },
                  { label: fr ? 'Alertes'           : 'Alertes',              val: data?.counts.alerts }
                ].map((item, i) => (
                  <div key={i} className="stats__summary-item">
                    <span>{item.label}</span>
                    <strong style={{ color:'var(--accent)' }}>{item.val}</strong>
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
