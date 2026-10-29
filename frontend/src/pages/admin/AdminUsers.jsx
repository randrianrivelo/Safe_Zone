import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminUsers() {
  const { theme } = useThemeStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadUsers()
  }, [theme])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (id, role) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:8000/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role })
      })
      await loadUsers()
    } catch {}
  }

  const banUser = async (id, ban) => {
    const msg = ban
      ? (fr ? 'Bannir cet utilisateur ?' : 'Manara-maso io mpampiasa io ?')
      : (fr ? 'Débannir cet utilisateur ?' : 'Averina io mpampiasa io ?')
    if (!window.confirm(msg)) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:8000/api/admin/users/${id}/${ban ? 'ban' : 'unban'}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await loadUsers()
    } catch {}
  }

  const roleColor = { citizen: '#38bdf8', agent: '#ff9500', admin: '#a855f7' }

  const filtered = Array.isArray(users) ? users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = !filter || u.role === filter
    return matchSearch && matchFilter
  }) : []

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-people" /> {fr ? 'Gestion des utilisateurs' : 'Fitantanana mpampiasa'}</h1>
          <span className="admin-page__count">{filtered.length} {fr ? 'utilisateurs' : 'mpampiasa'}</span>
        </div>

        <div className="admin-page__controls">
          <div className="admin-page__search">
            <i className="bi bi-search" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Nom ou email...' : 'Anarana na email...'}
            />
          </div>
          <select
            className="admin-page__filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">{fr ? 'Tous les rôles' : 'Andraikitra rehetra'}</option>
            <option value="citizen">Citizen</option>
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          <button className="admin-page__refresh" onClick={loadUsers}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>

        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{fr ? 'Nom' : 'Anarana'}</th>
                  <th>Email</th>
                  <th>{fr ? 'Rôle' : 'Andraikitra'}</th>
                  <th>{fr ? 'Statut' : 'Sata'}</th>
                  <th>{fr ? 'Dernière connexion' : 'Hiditra farany'}</th>
                  <th>{fr ? 'Actions' : 'Hetsika'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={i}>
                    <td className="admin-page__td-id">#{u.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: roleColor[u.role] || '#94a3b8',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#050816', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0
                        }}>
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <strong>{u.name || '—'}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <select
                        className="admin-page__edit-select"
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        <option value="citizen">Citizen</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span style={{
                        color: u.is_active ? '#39ff88' : '#ff3b30',
                        fontWeight: 700, fontSize: '0.82rem'
                      }}>
                        {u.is_active ? (fr ? 'Actif' : 'Mavitrika') : (fr ? 'Banni' : 'Voasakana')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {u.last_login
                        ? new Date(u.last_login).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td>
                      <button
                        className={`admin-page__toggle-btn ${u.is_active ? 'active' : 'inactive'}`}
                        onClick={() => banUser(u.id, u.is_active)}
                      >
                        <i className={`bi bi-${u.is_active ? 'lock' : 'unlock'}`} />
                        {u.is_active ? (fr ? 'Bannir' : 'Manapoaka') : (fr ? 'Débannir' : 'Averina')}
                      </button>
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