import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { shelterService } from '../../services/shelterService'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

// Fonction pour récupérer le token correctement
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

export default function AdminShelters() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadShelters() {
    setLoading(true)
    setError('')
    try {
      const data = await shelterService.getAll()
      setShelters(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Erreur chargement refuges:', err)
      setError(err?.message || 'Erreur lors du chargement')
      setShelters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadShelters()
  }, [theme])

  const startEdit = (shelter) => {
    setEditing(shelter.id)
    setEditData({
      current_occupancy: shelter.current_occupancy,
      status: shelter.status
    })
  }

  const saveEdit = async (id) => {
    setSaving(true)
    setError('')
    try {
      const token = getAuthToken()
      if (!token) {
        setError(fr ? 'Session expirée, veuillez vous reconnecter' : 'Lasa ny session, midira indray')
        return
      }

      const response = await fetch(`http://localhost:8000/api/shelters/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        setEditing(null)
        await loadShelters()
      } else if (response.status === 401) {
        setError(fr ? 'Session expirée, veuillez vous reconnecter' : 'Lasa ny session, midira indray')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Erreur lors de la sauvegarde')
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError(err?.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const filtered = shelters.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = !filter || s.status === filter
    return matchSearch && matchFilter
  })

  const statusColor = {
    ouvert: '#39ff88',
    sature: '#ff9500',
    ferme: '#ff3b30',
    en_preparation: '#38bdf8'
  }

  const statusLabel = {
    ouvert: fr ? 'Ouvert' : 'Misokatra',
    sature: fr ? 'Saturé' : 'Feno',
    ferme: fr ? 'Fermé' : 'Voarindrina',
    en_preparation: fr ? 'En préparation' : 'Amboariana'
  }

  const typeLabel = {
    ecole: fr ? 'École' : 'Sekoly',
    stade: fr ? 'Stade' : 'Kianja',
    eglise: fr ? 'Église' : 'Fiangonana',
    gymnase: fr ? 'Gymnase' : 'Gymnase',
    centre_comm: fr ? 'Centre communautaire' : 'Foibe',
    hopital: fr ? 'Hôpital' : 'Hopitaly',
    universite: fr ? 'Université' : 'Oniversite',
    caserne: fr ? 'Caserne' : 'Toby',
    marche: fr ? 'Marché' : 'Tsena'
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-building" /> {fr ? 'Gestion des refuges' : 'Fitantanana toerana'}</h1>
          <span className="admin-page__count">{filtered.length} {fr ? 'refuges' : 'toerana'}</span>
        </div>

        {/* Filtres */}
        <div className="admin-page__controls">
          <div className="admin-page__search">
            <i className="bi bi-search" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher un refuge...' : 'Mitady toerana...'}
            />
          </div>
          <select
            className="admin-page__filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">{fr ? 'Tous les statuts' : 'Sata rehetra'}</option>
            <option value="ouvert">{fr ? 'Ouvert' : 'Misokatra'}</option>
            <option value="sature">{fr ? 'Saturé' : 'Feno'}</option>
            <option value="ferme">{fr ? 'Fermé' : 'Voarindrina'}</option>
            <option value="en_preparation">{fr ? 'En préparation' : 'Amboariana'}</option>
          </select>
          <button className="admin-page__refresh" onClick={loadShelters}>
            <i className="bi bi-arrow-clockwise" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="admin-page__error">
            <i className="bi bi-exclamation-triangle-fill" />
            {error}
            <button onClick={() => window.location.href = '/login'} className="admin-page__error-btn">
              {fr ? 'Se reconnecter' : 'Hiditra indray'}
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-page__empty">
            <i className="bi bi-building" />
            <span>{fr ? 'Aucun refuge trouvé' : 'Tsy misy toerana hita'}</span>
          </div>
        ) : (
          <div className="admin-page__table-wrap">
            <table className="admin-page__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{fr ? 'Nom' : 'Anarana'}</th>
                  <th>{fr ? 'Type' : 'Karazana'}</th>
                  <th>{fr ? 'District' : 'Distrika'}</th>
                  <th>{fr ? 'Capacité' : 'Haben\'ny'}</th>
                  <th>{fr ? 'Occupation' : 'Fampiasana'}</th>
                  <th>{fr ? 'Statut' : 'Sata'}</th>
                  <th>{fr ? 'Services' : 'Serivisy'}</th>
                  <th>{fr ? 'Actions' : 'Hetsika'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const pct = s.capacity_total ? Math.round((s.current_occupancy / s.capacity_total) * 100) : 0
                  const clr = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
                  const isEditing = editing === s.id

                  return (
                    <tr key={i}>
                      <td className="admin-page__td-id">#{s.id}</td>
                      <td className="admin-page__shelter-name">
                        <strong>{s.name}</strong>
                      </td>
                      <td><span className="admin-page__type-badge">{typeLabel[s.shelter_type] || s.shelter_type}</span></td>
                      <td>{s.district || '—'}</td>
                      <td>{s.capacity_total?.toLocaleString('fr-FR')}</td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="admin-page__edit-input"
                            value={editData.current_occupancy}
                            min={0}
                            max={s.capacity_total}
                            onChange={(e) => setEditData({...editData, current_occupancy: parseInt(e.target.value) || 0})}
                          />
                        ) : (
                          <div className="admin-page__occ">
                            <div className="admin-page__occ-bar">
                              <div style={{ width: `${pct}%`, background: clr }} />
                            </div>
                            <span style={{ color: clr }}>
                              {s.current_occupancy}/{s.capacity_total} ({pct}%)
                            </span>
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select
                            className="admin-page__edit-select"
                            value={editData.status}
                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                          >
                            <option value="ouvert">{fr ? 'Ouvert' : 'Misokatra'}</option>
                            <option value="sature">{fr ? 'Saturé' : 'Feno'}</option>
                            <option value="ferme">{fr ? 'Fermé' : 'Voarindrina'}</option>
                            <option value="en_preparation">{fr ? 'En préparation' : 'Amboariana'}</option>
                          </select>
                        ) : (
                          <span
                            className="admin-page__status-badge"
                            style={{
                              background: `${statusColor[s.status]}15`,
                              color: statusColor[s.status],
                              border: `1px solid ${statusColor[s.status]}30`
                            }}
                          >
                            {statusLabel[s.status] || s.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="admin-page__services">
                          {s.has_water && <i className="bi bi-droplet-fill" title="Eau" style={{ color: '#38bdf8' }} />}
                          {s.has_electricity && <i className="bi bi-lightning-fill" title="Élec" style={{ color: '#ffd60a' }} />}
                          {s.has_medical && <i className="bi bi-heart-pulse-fill" title="Médical" style={{ color: '#ff3b30' }} />}
                          {s.has_food && <i className="bi bi-cup-hot-fill" title="Food" style={{ color: '#ff9500' }} />}
                          {s.has_toilets && <i className="bi bi-door-open-fill" title="WC" style={{ color: '#39ff88' }} />}
                        </div>
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="admin-page__edit-actions">
                            <button
                              className="admin-page__save-btn"
                              onClick={() => saveEdit(s.id)}
                              disabled={saving}
                            >
                              {saving ? <div className="spinner-sm" /> : <i className="bi bi-check-lg" />}
                            </button>
                            <button
                              className="admin-page__cancel-btn"
                              onClick={() => setEditing(null)}
                            >
                              <i className="bi bi-x" />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="admin-page__edit-btn"
                            onClick={() => startEdit(s)}
                          >
                            <i className="bi bi-pencil" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}