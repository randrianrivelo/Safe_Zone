import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'  // ← AJOUTER
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminAgents() {
  const { theme } = useThemeStore()
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState([])
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadAgents()
  }, [theme])

  const loadAgents = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res   = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setAgents(Array.isArray(data) ? data.filter(u => u.role === 'agent') : [])
    } catch { setAgents([]) }
    finally { setLoading(false) }
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-person-badge" /> {fr ? 'Gestion des agents' : 'Fitantanana mpiasan\'ny'}</h1>
          <span className="admin-page__count">{agents.length} {fr ? 'agents' : 'mpiasa'}</span>
        </div>

        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : agents.length === 0 ? (
          <div className="admin-page__empty">
            <i className="bi bi-person-badge" />
            <span>{fr ? 'Aucun agent — Promouvoir un citoyen en agent via Utilisateurs' : 'Tsy misy mpiasa — Anangony citizen ho agent amin\'ny Mpampiasa'}</span>
          </div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{fr ? 'Nom' : 'Anarana'}</th>
                  <th>Email</th>
                  <th>{fr ? 'Statut' : 'Sata'}</th>
                  <th>{fr ? 'Dernière connexion' : 'Hiditra farany'}</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a, i) => (
                  <tr key={i}>
                    <td className="admin-page__td-id">#{a.id}</td>
                    <td><strong>{a.name}</strong></td>
                    <td style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{a.email}</td>
                    <td>
                      <span style={{ color: a.is_active ? '#39ff88' : '#ff3b30', fontWeight:700, fontSize:'0.82rem' }}>
                        {a.is_active ? (fr ? 'Actif' : 'Mavitrika') : (fr ? 'Inactif' : 'Tsy mavitrika')}
                      </span>
                    </td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                      {a.last_login ? new Date(a.last_login).toLocaleDateString('fr-FR') : '—'}
                    </td>
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