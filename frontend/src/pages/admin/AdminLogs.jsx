import { useState, useEffect } from 'react'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadLogs() {
    setLoading(true)
    try {
      const raw = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setLogs(data)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark')
    const timer = setTimeout(() => {
      loadLogs()
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-clock-history" /> {fr ? 'Logs d\'activité' : 'Tantaran\'ny hetsika'}</h1>
          <button className="admin-page__refresh" onClick={loadLogs} disabled={loading}>
             <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>{fr ? 'Date' : 'Daty'}</th>
                  <th>{fr ? 'Module' : 'Module'}</th>
                  <th>{fr ? 'Action' : 'Hetsika'}</th>
                  <th>{fr ? 'Détails' : 'Antsipiriany'}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily:'monospace', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      {new Date(l.created_at).toLocaleString('fr-FR')}
                    </td>
                    <td>
                      <span className="admin-page__status-badge" style={{ background:'var(--accent-light)', color:'var(--accent)', border:'1px solid var(--border-accent)' }}>
                        {l.module}
                      </span>
                    </td>
                    <td style={{ fontSize:'0.82rem', fontWeight: 600 }}>{l.action}</td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{l.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
