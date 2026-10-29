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

export default function AdminDangers() {
  const { theme } = useThemeStore()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '',
    danger_type: 'inondation',
    center_lat: '',
    center_lon: '',
    radius_km: '1.0',
    severity: 'moyen',
    description: '',
    is_active: true
  })
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadZones()
  }, [theme])

  const loadZones = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/dangers/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setZones(Array.isArray(data) ? data : [])
      } else {
        setZones([])
      }
    } catch (err) {
      console.error('Erreur chargement:', err)
      setZones([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.center_lat || !form.center_lon) {
      alert(fr ? 'Veuillez remplir le nom et les coordonnées' : 'Fenoy ny anarana sy ny toerana')
      return
    }

    setSaving(true)
    try {
      const token = getAuthToken()
      const url = editingId ? `${API_URL}/dangers/${editingId}` : `${API_URL}/dangers/`
      const method = editingId ? 'PUT' : 'POST'

      const body = {
        name: form.name,
        danger_type: form.danger_type,
        center_lat: parseFloat(form.center_lat),
        center_lon: parseFloat(form.center_lon),
        radius_km: parseFloat(form.radius_km),
        severity: form.severity,
        description: form.description || '',
        is_active: form.is_active
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
        await loadZones()
        resetForm()
        alert(editingId ? (fr ? 'Zone modifiée !' : 'Faritra novaina !') : (fr ? 'Zone ajoutée !' : 'Faritra nampiana !'))
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

  const handleEdit = (zone) => {
    setEditingId(zone.id)
    setForm({
      name: zone.name || '',
      danger_type: zone.danger_type || 'inondation',
      center_lat: zone.center_lat || '',
      center_lon: zone.center_lon || '',
      radius_km: zone.radius_km || '1.0',
      severity: zone.severity || 'moyen',
      description: zone.description || '',
      is_active: zone.is_active !== undefined ? zone.is_active : true
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm(fr ? 'Supprimer cette zone ?' : 'Hamafa ity faritra ity ?')) return

    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/dangers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        await loadZones()
        alert(fr ? 'Zone supprimée' : 'Faritra voafafa')
      } else {
        throw new Error('Erreur suppression')
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
      alert(fr ? 'Erreur lors de la suppression' : 'Olana tamin\'ny famafana')
    }
  }

  const handleToggleActive = async (zone) => {
    try {
      const token = getAuthToken()
      const response = await fetch(`${API_URL}/dangers/${zone.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        await loadZones()
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
      danger_type: 'inondation',
      center_lat: '',
      center_lon: '',
      radius_km: '1.0',
      severity: 'moyen',
      description: '',
      is_active: true
    })
  }

  const severityLabels = {
    faible: fr ? 'Faible' : 'Kely',
    moyen: fr ? 'Moyen' : 'Antonony',
    eleve: fr ? 'Élevé' : 'Avo',
    critique: fr ? 'Critique' : 'Goavana'
  }

  const severityColors = {
    faible: '#39ff88',
    moyen: '#ffd60a',
    eleve: '#ff9500',
    critique: '#ff3b30'
  }

  const typeLabels = {
    inondation: fr ? 'Inondation' : 'Tondra-drano',
    glissement: fr ? 'Glissement' : 'Fihotsahan-tany',
    cyclone: fr ? 'Cyclone' : 'Rivo-doza',
    incendie: fr ? 'Incendie' : 'Afo'
  }

  const typeIcons = {
    inondation: 'bi-water',
    glissement: 'bi-triangle-fill',
    cyclone: 'bi-tornado',
    incendie: 'bi-fire'
  }

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
            <h1><i className="bi bi-radioactive"></i> {fr ? 'Zones dangereuses' : 'Faritra mampidi-doza'}</h1>
            <p className="admin-page__subtitle">{fr ? 'Gérez les zones à risque et leur niveau de danger' : 'Tantano ny faritra atahorana sy ny haavon\'ny loza'}</p>
          </div>
          <button className="admin-page__create-btn" onClick={() => { resetForm(); setShowForm(true) }}>
            <i className="bi bi-plus-lg"></i> {fr ? 'Ajouter une zone' : 'Hanampy faritra'}
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="admin-dangers__form">
            <div className="admin-dangers__form-header">
              <h3><i className={`bi bi-${editingId ? 'pencil-square' : 'plus-circle'}`}></i> {editingId ? (fr ? 'Modifier la zone' : 'Hanova faritra') : (fr ? 'Nouvelle zone' : 'Faritra vaovao')}</h3>
              <button className="admin-dangers__form-close" onClick={resetForm}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="admin-dangers__form-body">
              <div className="admin-dangers__form-grid">
                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-tag"></i> {fr ? 'Nom de la zone' : 'Anaran\'ny faritra'}</label>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder={fr ? 'Ex: Plaine Sisaony' : 'Ohatra: Lemaka Sisaony'} />
                </div>

                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-exclamation-triangle"></i> {fr ? 'Type de danger' : 'Karazana loza'}</label>
                  <select value={form.danger_type} onChange={(e) => setForm({...form, danger_type: e.target.value})}>
                    <option value="inondation">Inondation</option>
                    <option value="glissement">Glissement</option>
                    <option value="cyclone">Cyclone</option>
                    <option value="incendie">Incendie</option>
                  </select>
                </div>

                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-geo-alt"></i> {fr ? 'Latitude (centre)' : 'Latitude (afovoany)'}</label>
                  <input type="number" step="0.0001" value={form.center_lat} onChange={(e) => setForm({...form, center_lat: e.target.value})} placeholder="-18.9750" />
                </div>

                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-geo-alt"></i> {fr ? 'Longitude (centre)' : 'Longitude (afovoany)'}</label>
                  <input type="number" step="0.0001" value={form.center_lon} onChange={(e) => setForm({...form, center_lon: e.target.value})} placeholder="47.4950" />
                </div>

                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-rulers"></i> {fr ? 'Rayon (km)' : 'Radaorany (km)'}</label>
                  <input type="number" step="0.1" value={form.radius_km} onChange={(e) => setForm({...form, radius_km: e.target.value})} placeholder="3.5" />
                </div>

                <div className="admin-dangers__form-field">
                  <label><i className="bi bi-activity"></i> {fr ? 'Sévérité' : 'Haben\'ny'}</label>
                  <select value={form.severity} onChange={(e) => setForm({...form, severity: e.target.value})}>
                    <option value="faible">Faible</option>
                    <option value="moyen">Moyen</option>
                    <option value="eleve">Élevé</option>
                    <option value="critique">Critique</option>
                  </select>
                  <div className="admin-dangers__severity-preview">
                    <span className="severity-dot" style={{ background: severityColors[form.severity] }}></span>
                    <span>{severityLabels[form.severity]}</span>
                  </div>
                </div>

                <div className="admin-dangers__form-field admin-dangers__form-field--full">
                  <label><i className="bi bi-chat-text"></i> {fr ? 'Description' : 'Famaritana'}</label>
                  <textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder={fr ? 'Description de la zone dangereuse...' : 'Famaritana ny faritra mampidi-doza...'} />
                </div>

                <div className="admin-dangers__form-field">
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} />
                    <span><i className="bi bi-check-circle"></i> {fr ? 'Zone active' : 'Faritra mavitrika'}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-dangers__form-footer">
              <button className="admin-dangers__btn admin-dangers__btn-secondary" onClick={resetForm}>
                <i className="bi bi-x"></i> {fr ? 'Annuler' : 'Ajanony'}
              </button>
              <button className="admin-dangers__btn admin-dangers__btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <><div className="spinner-sm"></div> {fr ? 'Sauvegarde...' : 'Mitahiry...'}</> : <><i className="bi bi-save"></i> {fr ? 'Sauvegarder' : 'Tahirizo'}</>}
              </button>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="admin-dangers__stats">
          <div className="admin-dangers__stat">
            <i className="bi bi-radioactive"></i>
            <span className="admin-dangers__stat-value">{zones.length}</span>
            <span className="admin-dangers__stat-label">{fr ? 'Total zones' : 'Faritra rehetra'}</span>
          </div>
          <div className="admin-dangers__stat">
            <i className="bi bi-check-circle-fill" style={{ color: '#39ff88' }}></i>
            <span className="admin-dangers__stat-value">{zones.filter(z => z.is_active).length}</span>
            <span className="admin-dangers__stat-label">{fr ? 'Zones actives' : 'Faritra mavitrika'}</span>
          </div>
          <div className="admin-dangers__stat">
            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff9500' }}></i>
            <span className="admin-dangers__stat-value">{zones.filter(z => z.severity === 'eleve' || z.severity === 'critique').length}</span>
            <span className="admin-dangers__stat-label">{fr ? 'Danger élevé' : 'Loza avo'}</span>
          </div>
          <div className="admin-dangers__stat">
            <i className="bi bi-water"></i>
            <span className="admin-dangers__stat-value">{zones.filter(z => z.danger_type === 'inondation').length}</span>
            <span className="admin-dangers__stat-label">{fr ? 'Inondations' : 'Tondra-drano'}</span>
          </div>
        </div>

        {/* Liste des zones */}
        <div className="admin-dangers__grid">
          {zones.length === 0 ? (
            <div className="admin-dangers__empty">
              <i className="bi bi-radioactive"></i>
              <span>{fr ? 'Aucune zone dangereuse' : 'Tsy misy faritra mampidi-doza'}</span>
              <button className="admin-dangers__empty-btn" onClick={() => { resetForm(); setShowForm(true) }}>
                <i className="bi bi-plus-lg"></i> {fr ? 'Ajouter une zone' : 'Hanampy faritra'}
              </button>
            </div>
          ) : (
            zones.map((zone) => (
              <div key={zone.id} className="admin-dangers__card" style={{ borderLeftColor: severityColors[zone.severity] }}>
                <div className="admin-dangers__card-header">
                  <div className="admin-dangers__card-icon" style={{ background: `${severityColors[zone.severity]}15` }}>
                    <i className={typeIcons[zone.danger_type] || 'bi-exclamation-triangle'} style={{ color: severityColors[zone.severity] }}></i>
                  </div>
                  <div className="admin-dangers__card-info">
                    <h3>{zone.name}</h3>
                    <span className="admin-dangers__card-type">{typeLabels[zone.danger_type] || zone.danger_type}</span>
                  </div>
                  <span className="admin-dangers__severity-badge" style={{ background: `${severityColors[zone.severity]}15`, color: severityColors[zone.severity] }}>
                    {severityLabels[zone.severity]}
                  </span>
                </div>

                <p className="admin-dangers__card-desc">{zone.description || (fr ? 'Aucune description' : 'Tsy misy famaritana')}</p>

                <div className="admin-dangers__card-coords">
                  <i className="bi bi-geo-alt"></i>
                  <span>{zone.center_lat}, {zone.center_lon}</span>
                  <span className="admin-dangers__card-radius">
                    <i className="bi bi-rulers"></i> {zone.radius_km} km
                  </span>
                </div>

                <div className="admin-dangers__card-actions">
                  <button className={`admin-dangers__toggle-btn ${zone.is_active ? 'active' : 'inactive'}`} onClick={() => handleToggleActive(zone)}>
                    <i className={`bi bi-${zone.is_active ? 'toggle-on' : 'toggle-off'}`}></i>
                    {zone.is_active ? (fr ? 'Active' : 'Mavitrika') : (fr ? 'Inactive' : 'Tsy mavitrika')}
                  </button>
                  <button className="admin-dangers__action-btn edit" onClick={() => handleEdit(zone)}>
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button className="admin-dangers__action-btn delete" onClick={() => handleDelete(zone.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <style jsx>{`
        .admin-page__subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }

        /* Formulaire */
        .admin-dangers__form { background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 24px; overflow: hidden; }
        .admin-dangers__form-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--bg-input); border-bottom: 1px solid var(--border); }
        .admin-dangers__form-header h3 { font-size: 1rem; font-weight: 600; display: flex; align-items: center; gap: 8px; margin: 0; }
        .admin-dangers__form-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: var(--radius-sm); }
        .admin-dangers__form-close:hover { color: #ff3b30; background: rgba(255,59,48,0.1); }
        .admin-dangers__form-body { padding: 20px; }
        .admin-dangers__form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .admin-dangers__form-field--full { grid-column: 1 / -1; }
        .admin-dangers__form-field { display: flex; flex-direction: column; gap: 6px; }
        .admin-dangers__form-field label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
        .admin-dangers__form-field input, .admin-dangers__form-field select, .admin-dangers__form-field textarea { padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); color: var(--text-primary); font-size: 0.85rem; outline: none; font-family: inherit; }
        .admin-dangers__form-field input:focus, .admin-dangers__form-field select:focus, .admin-dangers__form-field textarea:focus { border-color: var(--accent); }
        .admin-dangers__severity-preview { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
        .severity-dot { width: 12px; height: 12px; border-radius: 50%; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .admin-dangers__form-footer { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; background: var(--bg-input); border-top: 1px solid var(--border); }

        /* Boutons */
        .admin-dangers__btn { padding: 8px 20px; border: none; border-radius: var(--radius-md); font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .admin-dangers__btn-primary { background: var(--accent); color: #fff; }
        .admin-dangers__btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
        .admin-dangers__btn-secondary { background: var(--bg-input); border: 1px solid var(--border); color: var(--text-secondary); }
        .admin-dangers__btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
        .admin-dangers__btn:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Stats */
        .admin-dangers__stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .admin-dangers__stat { background: var(--glass-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; text-align: center; }
        .admin-dangers__stat i { font-size: 1.5rem; color: var(--accent); display: block; margin-bottom: 8px; }
        .admin-dangers__stat-value { font-size: 1.5rem; font-weight: 800; display: block; }
        .admin-dangers__stat-label { font-size: 0.7rem; color: var(--text-secondary); }

        /* Grille des zones */
        .admin-dangers__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
        .admin-dangers__card { background: var(--glass-bg); border: 1px solid var(--border); border-left: 4px solid; border-radius: var(--radius-lg); padding: 16px; transition: all 0.2s; }
        .admin-dangers__card:hover { transform: translateY(-2px); border-color: var(--border-accent); }
        .admin-dangers__card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .admin-dangers__card-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: var(--radius-md); }
        .admin-dangers__card-icon i { font-size: 1.2rem; }
        .admin-dangers__card-info { flex: 1; }
        .admin-dangers__card-info h3 { font-size: 0.9rem; font-weight: 600; margin: 0; }
        .admin-dangers__card-type { font-size: 0.7rem; color: var(--text-muted); }
        .admin-dangers__severity-badge { padding: 2px 10px; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600; }
        .admin-dangers__card-desc { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.5; }
        .admin-dangers__card-coords { display: flex; align-items: center; gap: 12px; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 12px; flex-wrap: wrap; }
        .admin-dangers__card-radius { display: inline-flex; align-items: center; gap: 4px; }
        .admin-dangers__card-actions { display: flex; gap: 8px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border); }
        .admin-dangers__toggle-btn { padding: 6px 12px; border: none; border-radius: var(--radius-full); font-size: 0.7rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        .admin-dangers__toggle-btn.active { background: rgba(57,255,136,0.15); color: #39ff88; border: 1px solid rgba(57,255,136,0.3); }
        .admin-dangers__toggle-btn.inactive { background: rgba(255,59,48,0.15); color: #ff3b30; border: 1px solid rgba(255,59,48,0.3); }
        .admin-dangers__action-btn { width: 32px; height: 32px; border: none; border-radius: var(--radius-sm); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .admin-dangers__action-btn.edit { background: var(--accent-light); color: var(--accent); }
        .admin-dangers__action-btn.edit:hover { background: var(--accent); color: #fff; }
        .admin-dangers__action-btn.delete { background: rgba(255,59,48,0.1); color: #ff3b30; }
        .admin-dangers__action-btn.delete:hover { background: #ff3b30; color: #fff; }

        /* Empty state */
        .admin-dangers__empty { text-align: center; padding: 60px; background: var(--glass-bg); border: 1px solid var(--border); border-radius: var(--radius-lg); }
        .admin-dangers__empty i { font-size: 3rem; display: block; margin-bottom: 12px; color: var(--text-muted); }
        .admin-dangers__empty span { display: block; margin-bottom: 16px; color: var(--text-secondary); }
        .admin-dangers__empty-btn { padding: 8px 20px; background: var(--accent); border: none; border-radius: var(--radius-md); color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }

        .spinner-sm { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 900px) { .admin-dangers__stats { grid-template-columns: repeat(2, 1fr); } .admin-dangers__grid { grid-template-columns: 1fr; } }
        @media (max-width: 768px) { .admin-page__main { padding: 70px 16px 24px; } .admin-dangers__stats { gap: 10px; } }
      `}</style>
    </div>
  )
}