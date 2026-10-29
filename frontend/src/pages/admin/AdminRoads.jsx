import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

const API_URL = 'http://localhost:8000/api'

const getAuthToken = () => {
  let token = localStorage.getItem('token')
  if (!token) return null
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1)
  }
  return token
}

export default function AdminRoads() {
  const { theme } = useThemeStore()
  const [roads, setRoads] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    road_type: 'urbaine',
    start_lat: '',
    start_lon: '',
    end_lat: '',
    end_lon: '',
    distance_km: '',
    status: 'normal',
    is_passable: true,
    danger_level: 0
  })
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadRoads()
  }, [theme])

  const loadRoads = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/roads/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setRoads(Array.isArray(data) ? data : [])
      } else {
        setRoads([])
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
      setRoads([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.start_lat || !form.start_lon || !form.end_lat || !form.end_lon) {
      alert(fr ? 'Veuillez remplir tous les champs obligatoires' : 'Fenoy ny saha rehetra')
      return
    }

    setSaving(true)
    try {
      const token = getAuthToken()
      const url = editingId ? `${API_URL}/roads/${editingId}` : `${API_URL}/roads/`
      const method = editingId ? 'PUT' : 'POST'

      const body = {
        name: form.name,
        road_type: form.road_type,
        start_lat: parseFloat(form.start_lat),
        start_lon: parseFloat(form.start_lon),
        end_lat: parseFloat(form.end_lat),
        end_lon: parseFloat(form.end_lon),
        distance_km: parseFloat(form.distance_km) || 0,
        status: form.status,
        is_passable: form.is_passable,
        danger_level: parseInt(form.danger_level)
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        await loadRoads()
        resetForm()
        alert(editingId ? (fr ? 'Route modifiée !' : 'Lalana novaina !') : (fr ? 'Route ajoutée !' : 'Lalana nampiana !'))
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Erreur')
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert(fr ? 'Erreur lors de la sauvegarde' : 'Olana tamin\'ny fitehirizana')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (road) => {
    setEditingId(road.id)
    setForm({
      name: road.name || '',
      road_type: road.road_type || 'urbaine',
      start_lat: road.start_lat || '',
      start_lon: road.start_lon || '',
      end_lat: road.end_lat || '',
      end_lon: road.end_lon || '',
      distance_km: road.distance_km || '',
      status: road.status || 'normal',
      is_passable: road.is_passable !== undefined ? road.is_passable : true,
      danger_level: road.danger_level || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(fr ? 'Supprimer cette route ?' : 'Hamafa ity lalana ity ?')) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/roads/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        await loadRoads()
        alert(fr ? 'Route supprimée' : 'Lalana voafafa')
      } else {
        throw new Error('Erreur suppression')
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert(fr ? 'Erreur lors de la suppression' : 'Olana tamin\'ny famafana')
    }
  }

  const handleTogglePassable = async (road) => {
    try {
      const token = getAuthToken()
      const newStatus = road.is_passable ? 'bloque' : 'normal'
      const newPassable = !road.is_passable

      const response = await fetch(`${API_URL}/roads/${road.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          is_passable: newPassable,
          danger_level: road.danger_level
        })
      })
      if (response.ok) {
        await loadRoads()
      }
    } catch (err) {
      console.error('Erreur:', err)
      alert(fr ? 'Erreur lors du changement de statut' : 'Olana tamin\'ny fanovana sata')
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm({
      name: '',
      road_type: 'urbaine',
      start_lat: '',
      start_lon: '',
      end_lat: '',
      end_lon: '',
      distance_km: '',
      status: 'normal',
      is_passable: true,
      danger_level: 0
    })
  }

  const statusLabels = {
    normal: fr ? 'Normal' : 'Mahazatra',
    endommage: fr ? 'Endommagé' : 'Simba',
    inonde: fr ? 'Inondé' : 'Tondraka',
    detruit: fr ? 'Détruit' : 'Ravana',
    bloque: fr ? 'Bloqué' : 'Sakana'
  }

  const statusColors = {
    normal: '#39ff88',
    endommage: '#ffd60a',
    inonde: '#38bdf8',
    detruit: '#ff3b30',
    bloque: '#ff9500'
  }

  const typeOptions = [
    { value: 'urbaine', label: fr ? 'Urbaine' : 'An-tanàna' },
    { value: 'nationale', label: fr ? 'Nationale' : 'Nasionaly' },
    { value: 'secondaire', label: fr ? 'Secondaire' : 'Faharoa' },
    { value: 'locale', label: fr ? 'Locale' : 'Eo an-toerana' }
  ]

  if (loading) {
    return (
      <div className="admin-page">
        <Navbar />
        <div className="admin-page__loading"><div className="spinner-lg" /></div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <div>
            <h1><i className="bi bi-signpost-split"></i> {fr ? 'Gestion des routes' : 'Fitantanana lalana'}</h1>
            <p className="admin-page__subtitle">{fr ? 'Gérez les routes et leur état de praticabilité' : 'Tantano ny lalana sy ny toe-pahasalamany'}</p>
          </div>
          <button className="admin-page__create-btn" onClick={() => { resetForm(); setShowForm(true) }}>
            <i className="bi bi-plus-lg"></i> {fr ? 'Ajouter une route' : 'Hanampy lalana'}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="admin-roads__form">
            <div className="admin-roads__form-header">
              <h3><i className={`bi bi-${editingId ? 'pencil-square' : 'plus-circle'}`}></i> {editingId ? (fr ? 'Modifier la route' : 'Hanova lalana') : (fr ? 'Nouvelle route' : 'Lalana vaovao')}</h3>
              <button className="admin-roads__form-close" onClick={resetForm}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="admin-roads__form-body">
              <div className="admin-roads__form-grid">
                <div className="admin-roads__form-field">
                  <label><i className="bi bi-signpost"></i> {fr ? 'Nom de la route' : 'Anaran\'ny lalana'}</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={fr ? 'Ex: RN2' : 'Ohatra: RN2'} />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-tag"></i> {fr ? 'Type' : 'Karazana'}</label>
                  <select value={form.road_type} onChange={(e) => setForm({...form, road_type: e.target.value})}>
                    {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-geo-alt"></i> {fr ? 'Latitude départ' : 'Latitude fiaingana'}</label>
                  <input type="number" step="0.0001" value={form.start_lat} onChange={(e) => setForm({...form, start_lat: e.target.value})} placeholder="-18.9137" />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-geo-alt"></i> {fr ? 'Longitude départ' : 'Longitude fiaingana'}</label>
                  <input type="number" step="0.0001" value={form.start_lon} onChange={(e) => setForm({...form, start_lon: e.target.value})} placeholder="47.5361" />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-geo-alt-fill"></i> {fr ? 'Latitude arrivée' : 'Latitude fahatongavana'}</label>
                  <input type="number" step="0.0001" value={form.end_lat} onChange={(e) => setForm({...form, end_lat: e.target.value})} placeholder="-18.9150" />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-geo-alt-fill"></i> {fr ? 'Longitude arrivée' : 'Longitude fahatongavana'}</label>
                  <input type="number" step="0.0001" value={form.end_lon} onChange={(e) => setForm({...form, end_lon: e.target.value})} placeholder="47.5370" />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-rulers"></i> {fr ? 'Distance (km)' : 'Halavirana (km)'}</label>
                  <input type="number" step="0.1" value={form.distance_km} onChange={(e) => setForm({...form, distance_km: e.target.value})} placeholder="1.5" />
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-activity"></i> {fr ? 'Statut' : 'Sata'}</label>
                  <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                    <option value="normal">Normal</option>
                    <option value="endommage">Endommagé</option>
                    <option value="inonde">Inondé</option>
                    <option value="detruit">Détruit</option>
                    <option value="bloque">Bloqué</option>
                  </select>
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-check-circle"></i> {fr ? 'Praticable' : 'Azo aleha'}</label>
                  <select value={form.is_passable} onChange={(e) => setForm({...form, is_passable: e.target.value === 'true'})}>
                    <option value="true">{fr ? 'Oui' : 'Eny'}</option>
                    <option value="false">{fr ? 'Non' : 'Tsia'}</option>
                  </select>
                </div>

                <div className="admin-roads__form-field">
                  <label><i className="bi bi-exclamation-triangle"></i> {fr ? 'Niveau danger (0-3)' : 'Haben\'ny loza (0-3)'}</label>
                  <input type="number" min="0" max="3" value={form.danger_level} onChange={(e) => setForm({...form, danger_level: e.target.value})} />
                  <div className="admin-roads__danger-preview">
                    {[0,1,2,3].map(d => (
                      <span key={d} className="danger-dot" style={{ background: d <= (form.danger_level || 0) ? '#ff3b30' : 'var(--border)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-roads__form-footer">
              <button className="admin-roads__btn admin-roads__btn-secondary" onClick={resetForm}>
                <i className="bi bi-x"></i> {fr ? 'Annuler' : 'Ajanony'}
              </button>
              <button className="admin-roads__btn admin-roads__btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <><div className="spinner-sm"></div> {fr ? 'Sauvegarde...' : 'Mitahiry...'}</> : <><i className="bi bi-save"></i> {fr ? 'Sauvegarder' : 'Tahirizo'}</>}
              </button>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="admin-roads__stats">
          <div className="admin-roads__stat">
            <i className="bi bi-signpost-split"></i>
            <span className="admin-roads__stat-value">{roads.length}</span>
            <span className="admin-roads__stat-label">{fr ? 'Total routes' : 'Lalana rehetra'}</span>
          </div>
          <div className="admin-roads__stat">
            <i className="bi bi-check-circle-fill" style={{ color: '#39ff88' }}></i>
            <span className="admin-roads__stat-value">{roads.filter(r => r.is_passable).length}</span>
            <span className="admin-roads__stat-label">{fr ? 'Routes praticables' : 'Lalana azo aleha'}</span>
          </div>
          <div className="admin-roads__stat">
            <i className="bi bi-x-circle-fill" style={{ color: '#ff3b30' }}></i>
            <span className="admin-roads__stat-value">{roads.filter(r => !r.is_passable).length}</span>
            <span className="admin-roads__stat-label">{fr ? 'Routes bloquées' : 'Lalana voasakana'}</span>
          </div>
          <div className="admin-roads__stat">
            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff9500' }}></i>
            <span className="admin-roads__stat-value">{roads.filter(r => r.danger_level >= 2).length}</span>
            <span className="admin-roads__stat-label">{fr ? 'Routes dangereuses' : 'Lalana mampidi-doza'}</span>
          </div>
        </div>

        {/* Tableau */}
        <div className="admin-roads__table-wrapper">
          <table className="admin-roads__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{fr ? 'Nom' : 'Anarana'}</th>
                <th>{fr ? 'Type' : 'Karazana'}</th>
                <th>{fr ? 'Distance' : 'Halavirana'}</th>
                <th>{fr ? 'Statut' : 'Sata'}</th>
                <th>{fr ? 'Praticable' : 'Azo aleha'}</th>
                <th>{fr ? 'Danger' : 'Loza'}</th>
                <th>{fr ? 'Actions' : 'Hetsika'}</th>
              </tr>
            </thead>
            <tbody>
              {roads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-roads__empty">
                    <i className="bi bi-signpost-split"></i>
                    <span>{fr ? 'Aucune route trouvée' : 'Tsy misy lalana hita'}</span>
                    <button className="admin-roads__empty-btn" onClick={() => { resetForm(); setShowForm(true) }}>
                      <i className="bi bi-plus-lg"></i> {fr ? 'Ajouter une route' : 'Hanampy lalana'}
                    </button>
                  </td>
                </tr>
              ) : (
                roads.map((r) => (
                  <tr key={r.id}>
                    <td className="admin-roads__td-id">#{r.id}</td>
                    <td className="admin-roads__td-name">
                      <strong>{r.name}</strong>
                      <span className="admin-roads__type-badge">{r.road_type}</span>
                    </td>
                    <td>{typeOptions.find(t => t.value === r.road_type)?.label || r.road_type}</td>
                    <td>{r.distance_km} km</td>
                    <td>
                      <span className="admin-roads__status-badge" style={{
                        background: `${statusColors[r.status]}15`,
                        color: statusColors[r.status]
                      }}>
                        {statusLabels[r.status] || r.status}
                      </span>
                    </td>
                    <td>
                      <button className={`admin-roads__toggle-btn ${r.is_passable ? 'active' : 'inactive'}`} onClick={() => handleTogglePassable(r)}>
                        <i className={`bi bi-${r.is_passable ? 'check-circle-fill' : 'x-circle-fill'}`}></i>
                        {r.is_passable ? (fr ? 'Ouvert' : 'Misokatra') : (fr ? 'Fermé' : 'Mihidy')}
                      </button>
                    </td>
                    <td>
                      <div className="admin-roads__danger-dots">
                        {[0,1,2,3].map(d => (
                          <span key={d} className="danger-dot" style={{ background: d <= (r.danger_level || 0) ? '#ff3b30' : 'var(--border)' }} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="admin-roads__actions">
                        <button className="admin-roads__action-btn edit" onClick={() => handleEdit(r)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="admin-roads__action-btn delete" onClick={() => handleDelete(r.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <style jsx>{`
        .admin-page__subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }
        .admin-roads__form { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 24px; overflow: hidden; }
        .admin-roads__form-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-input); border-bottom: 1px solid var(--border); }
        .admin-roads__form-header h3 { font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; }
        .admin-roads__form-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
        .admin-roads__form-close:hover { color: #ff3b30; background: rgba(255,59,48,0.1); }
        .admin-roads__form-body { padding: 20px; }
        .admin-roads__form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .admin-roads__form-field { display: flex; flex-direction: column; gap: 6px; }
        .admin-roads__form-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        .admin-roads__form-field input, .admin-roads__form-field select { padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; outline: none; }
        .admin-roads__form-field input:focus, .admin-roads__form-field select:focus { border-color: var(--accent); }
        .admin-roads__danger-preview { display: flex; gap: 6px; margin-top: 6px; }
        .danger-dot { width: 10px; height: 10px; border-radius: 50%; }
        .admin-roads__form-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; background: var(--bg-input); border-top: 1px solid var(--border); }
        .admin-roads__btn { padding: 8px 20px; border: none; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .admin-roads__btn-primary { background: var(--accent); color: #fff; }
        .admin-roads__btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        .admin-roads__btn-secondary { background: var(--bg-input); border: 1px solid var(--border); color: var(--text-secondary); }
        .admin-roads__btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
        .admin-roads__btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .admin-roads__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .admin-roads__stat { background: var(--glass-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; text-align: center; }
        .admin-roads__stat i { font-size: 1.5rem; color: var(--accent); display: block; margin-bottom: 8px; }
        .admin-roads__stat-value { font-size: 1.5rem; font-weight: 800; display: block; }
        .admin-roads__stat-label { font-size: 0.7rem; color: var(--text-secondary); }
        .admin-roads__table-wrapper { background: var(--glass-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow-x: auto; }
        .admin-roads__table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .admin-roads__table th, .admin-roads__table td { padding: 14px 12px; text-align: left; border-bottom: 1px solid var(--border); }
        .admin-roads__table th { background: var(--bg-input); font-weight: 600; color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; }
        .admin-roads__table tbody tr:hover { background: var(--bg-input); }
        .admin-roads__td-id { color: var(--text-muted); font-family: monospace; font-size: 0.75rem; }
        .admin-roads__td-name strong { display: block; margin-bottom: 4px; }
        .admin-roads__type-badge { display: inline-block; padding: 2px 8px; background: var(--accent-light); color: var(--accent); border-radius: var(--radius-full); font-size: 0.65rem; font-weight: 600; }
        .admin-roads__status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600; }
        .admin-roads__toggle-btn { padding: 4px 12px; border: none; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .admin-roads__toggle-btn.active { background: rgba(57,255,136,0.15); color: #39ff88; border: 1px solid rgba(57,255,136,0.3); }
        .admin-roads__toggle-btn.inactive { background: rgba(255,59,48,0.15); color: #ff3b30; border: 1px solid rgba(255,59,48,0.3); }
        .admin-roads__danger-dots { display: flex; gap: 5px; }
        .admin-roads__actions { display: flex; gap: 8px; }
        .admin-roads__action-btn { width: 32px; height: 32px; border: none; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .admin-roads__action-btn.edit { background: var(--accent-light); color: var(--accent); }
        .admin-roads__action-btn.edit:hover { background: var(--accent); color: #fff; }
        .admin-roads__action-btn.delete { background: rgba(255,59,48,0.1); color: #ff3b30; }
        .admin-roads__action-btn.delete:hover { background: #ff3b30; color: #fff; }
        .admin-roads__empty { text-align: center; padding: 60px !important; }
        .admin-roads__empty i { font-size: 2.5rem; display: block; margin-bottom: 12px; color: var(--text-muted); }
        .admin-roads__empty span { display: block; margin-bottom: 16px; color: var(--text-secondary); }
        .admin-roads__empty-btn { padding: 8px 20px; background: var(--accent); border: none; border-radius: var(--radius-md); color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .admin-roads__stats { grid-template-columns: repeat(2, 1fr); } .admin-roads__form-grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .admin-page__main { padding: 70px 16px 24px; } .admin-roads__stats { gap: 10px; } .admin-roads__table th, .admin-roads__table td { padding: 10px 8px; font-size: 0.75rem; } }
      `}</style>
    </div>
  )
}