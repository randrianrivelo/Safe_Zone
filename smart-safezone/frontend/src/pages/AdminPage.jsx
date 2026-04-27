// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { refugeService, zoneService } from '../services/api'

export default function AdminPage() {
  const [refuges, setRefuges] = useState([])
  const [activeTab, setActiveTab] = useState('refuges')
  const [showForm, setShowForm] = useState(false)
  const [blockRouteId, setBlockRouteId] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    capacity: '',
    type: 'ecole',
    has_water: false,
    has_electricity: false,
    has_medical: false
  })

  useEffect(() => {
    loadRefuges()
  }, [])

  const loadRefuges = async () => {
    try {
      const res = await refugeService.getAll()
      setRefuges(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await refugeService.create({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        capacity: parseInt(formData.capacity)
      })
      setShowForm(false)
      setFormData({
        name: '',
        latitude: '',
        longitude: '',
        capacity: '',
        type: 'ecole',
        has_water: false,
        has_electricity: false,
        has_medical: false
      })
      loadRefuges()
      alert('Refuge créé avec succès !')
    } catch (err) {
      console.error(err)
      alert('Erreur lors de la création')
    }
  }

  const handleBlockRoute = async () => {
    if (!blockRouteId) {
      alert('Entrez un ID de route')
      return
    }
    try {
      const res = await zoneService.blockRoute(parseInt(blockRouteId))
      alert(res.data.message || 'Route bloquée !')
      setBlockRouteId('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="admin-page" style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <h1 className="mb-4">
        <i className="bi bi-gear-fill me-2"></i>
        Panneau d'Administration
      </h1>

      {/* ONGLETS */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'refuges' ? 'active' : ''}`}
            onClick={() => setActiveTab('refuges')}
          >
            <i className="bi bi-house-fill me-1"></i> Refuges
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'routes' ? 'active' : ''}`}
            onClick={() => setActiveTab('routes')}
          >
            <i className="bi bi-signpost-split-fill me-1"></i> Routes
          </button>
        </li>
      </ul>

      {/* ========== ONGLET REFUGES ========== */}
      {activeTab === 'refuges' && (
        <div className="admin-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0">
              <i className="bi bi-house-heart-fill me-2"></i>
              Gestion des Refuges ({refuges.length})
            </h3>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
              {showForm ? 'Annuler' : 'Ajouter un refuge'}
            </button>
          </div>

          {/* FORMULAIRE */}
          {showForm && (
            <form onSubmit={handleSubmit} className="card p-4 mb-4 bg-light">
              <h5 className="mb-3">
                <i className="bi bi-plus-circle-fill text-primary me-1"></i>
                Nouveau Refuge
              </h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">
                    <i className="bi bi-tag me-1"></i>Nom
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    placeholder="Ex: Lycée JJ Rabearivelo"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-geo-alt me-1"></i>Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    required
                    placeholder="-18.9137"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-geo me-1"></i>Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    required
                    placeholder="47.5261"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-people me-1"></i>Capacité
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    required
                    placeholder="500"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">
                    <i className="bi bi-building me-1"></i>Type
                  </label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                  >
                    <option value="ecole">École</option>
                    <option value="eglise">Église</option>
                    <option value="stade">Stade</option>
                    <option value="gymnase">Gymnase</option>
                    <option value="hopital">Hôpital</option>
                    <option value="centre">Centre communautaire</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end gap-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="water"
                      checked={formData.has_water}
                      onChange={(e) => handleInputChange('has_water', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="water">
                      <i className="bi bi-droplet-fill text-primary me-1"></i>Eau
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="elec"
                      checked={formData.has_electricity}
                      onChange={(e) => handleInputChange('has_electricity', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="elec">
                      <i className="bi bi-lightning-fill text-warning me-1"></i>Élec
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="med"
                      checked={formData.has_medical}
                      onChange={(e) => handleInputChange('has_medical', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="med">
                      <i className="bi bi-heart-pulse-fill text-danger me-1"></i>Méd
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-success mt-3">
                <i className="bi bi-check-lg me-1"></i>Enregistrer le refuge
              </button>
            </form>
          )}

          {/* TABLEAU */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>
                    <i className="bi bi-hash"></i>
                  </th>
                  <th>
                    <i className="bi bi-tag me-1"></i>Nom
                  </th>
                  <th>
                    <i className="bi bi-building me-1"></i>Type
                  </th>
                  <th>
                    <i className="bi bi-people me-1"></i>Cap.
                  </th>
                  <th>
                    <i className="bi bi-person-check me-1"></i>Occ.
                  </th>
                  <th>
                    <i className="bi bi-check-circle me-1"></i>Dispo
                  </th>
                  <th>
                    <i className="bi bi-tools me-1"></i>Équip.
                  </th>
                  <th>
                    <i className="bi bi-toggle-on me-1"></i>Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {refuges.map((refuge) => {
                  const available = refuge.capacity - (refuge.current_occupancy || 0)
                  const isFull = available <= 0

                  return (
                    <tr key={refuge.id} className={isFull ? 'table-danger' : ''}>
                      <td>{refuge.id}</td>
                      <td className="fw-bold">{refuge.name}</td>
                      <td>
                        <span className="badge bg-secondary">{refuge.type}</span>
                      </td>
                      <td>{refuge.capacity}</td>
                      <td>{refuge.current_occupancy || 0}</td>
                      <td>
                        <span className={`fw-bold ${isFull ? 'text-danger' : 'text-success'}`}>
                          {available}
                        </span>
                      </td>
                      <td>
                        {refuge.has_water && (
                          <i className="bi bi-droplet-fill text-primary me-1" title="Eau"></i>
                        )}
                        {refuge.has_electricity && (
                          <i
                            className="bi bi-lightning-fill text-warning me-1"
                            title="Électricité"
                          ></i>
                        )}
                        {refuge.has_medical && (
                          <i
                            className="bi bi-heart-pulse-fill text-danger me-1"
                            title="Médical"
                          ></i>
                        )}
                      </td>
                      <td>
                        {refuge.is_active ? (
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle-fill me-1"></i>Actif
                          </span>
                        ) : (
                          <span className="badge bg-secondary">Inactif</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== ONGLET ROUTES ========== */}
      {activeTab === 'routes' && (
        <div className="admin-card p-4">
          <h3 className="mb-3">
            <i className="bi bi-signpost-split-fill me-2"></i>
            Gestion des Routes
          </h3>
          <p className="text-muted mb-4">
            Bloquer des routes en cas de destruction ou d'inondation pour que l'algorithme les
            évite.
          </p>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-danger">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-x-octagon-fill text-danger me-2"></i>
                    Bloquer une route
                  </h5>
                  <p className="card-text text-muted small">
                    La route ne sera plus utilisée dans le calcul d'itinéraire.
                  </p>
                  <div className="input-group mt-3">
                    <span className="input-group-text">
                      <i className="bi bi-hash"></i>
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="ID de la route"
                      value={blockRouteId}
                      onChange={(e) => setBlockRouteId(e.target.value)}
                    />
                    <button className="btn btn-danger" onClick={handleBlockRoute}>
                      <i className="bi bi-x-lg me-1"></i>Bloquer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    Comment ça marche ?
                  </h5>
                  <ul className="small text-muted mb-0">
                    <li className="mb-1">
                      Chaque route a un <strong>ID unique</strong> dans la base de données
                    </li>
                    <li className="mb-1">
                      Quand vous bloquez une route, l'algorithme ne la prend plus en compte
                    </li>
                    <li className="mb-1">
                      Les itinéraires seront automatiquement recalculés
                    </li>
                    <li>
                      Les zones dangereuses sont aussi prises en compte
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}