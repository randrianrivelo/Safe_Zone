// src/pages/MapPage.jsx
import { useState, useEffect } from 'react'
import MapView from '../components/Map/MapView'
import RefugeList from '../components/Refuge/RefugeList'
import AlertBanner from '../components/Alert/AlertBanner'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useGeolocation } from '../hooks/useGeolocation'
import { refugeService, pathfindingService, zoneService } from '../services/api'

export default function MapPage() {
  const { position, loading: geoLoading } = useGeolocation()
  const [refuges, setRefuges] = useState([])
  const [dangerZones, setDangerZones] = useState([])
  const [selectedRefuge, setSelectedRefuge] = useState(null)
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // Charger les données au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        let refugesRes
        if (position) {
          refugesRes = await refugeService.getNearest(
            position.latitude,
            position.longitude,
            10
          )
        } else {
          refugesRes = await refugeService.getAll()
        }
        setRefuges(refugesRes.data)

        const zonesRes = await zoneService.getDangerZones()
        setDangerZones(zonesRes.data)
      } catch (err) {
        console.error('Erreur chargement:', err)
      }
    }
    loadData()
  }, [position])

  // Calculer itinéraire vers un refuge spécifique
  const handleCalculateRoute = async (refuge) => {
    if (!position) {
      alert('Activez la géolocalisation pour calculer un itinéraire.')
      return
    }

    setSelectedRefuge(refuge)
    setLoading(true)

    try {
      const res = await pathfindingService.findSafestRoute(
        position.latitude,
        position.longitude,
        refuge.id
      )
      if (res.data.success) {
        setRoute(res.data.data)
      }
    } catch (err) {
      console.error('Erreur itinéraire:', err)
      alert("Erreur lors du calcul de l'itinéraire.")
    } finally {
      setLoading(false)
    }
  }

  // Trouver automatiquement le meilleur refuge
  const handleAutoFind = async () => {
    if (!position) {
      alert('Activez la géolocalisation.')
      return
    }

    setLoading(true)

    try {
      const res = await pathfindingService.findBestRefuges(
        position.latitude,
        position.longitude
      )
      if (res.data.success && res.data.data.length > 0) {
        const best = res.data.data[0]
        setRoute(best)
        setSelectedRefuge({ id: best.refuge_id, name: best.refuge_name })
      } else {
        alert('Aucun refuge accessible trouvé.')
      }
    } catch (err) {
      console.error('Erreur auto find:', err)
    } finally {
      setLoading(false)
    }
  }

  // Sélectionner un refuge (sans calculer la route)
  const handleSelectRefuge = (refuge) => {
    setSelectedRefuge(refuge)
  }

  return (
    <div className="map-page">
      {/* BANNIÈRE D'ALERTE */}
      <AlertBanner />

      {/* LOCALISATION EN COURS */}
      {geoLoading && (
        <div className="alert-banner info">
          <div className="d-flex align-items-center gap-2">
            <div className="spinner-border spinner-border-sm" role="status"></div>
            <span>
              <i className="bi bi-geo-alt me-1"></i>Localisation en cours...
            </span>
          </div>
          <div></div>
        </div>
      )}

      {/* CONTENU PRINCIPAL */}
      <div className="map-container">
        {/* SIDEBAR */}
        {showSidebar && (
          <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
              <h2>
                <i className="bi bi-house-heart-fill"></i>
                Refuges à proximité
              </h2>

              <button
                className="btn btn-auto-find"
                onClick={handleAutoFind}
                disabled={loading || !position}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shield-fill-check"></i>
                    Trouver le refuge le plus sûr
                  </>
                )}
              </button>
            </div>

            {/* Info itinéraire */}
            {route && (
              <div className="route-info-box">
                <h4>
                  <i className="bi bi-compass-fill me-1"></i>
                  Itinéraire calculé
                </h4>
                <div className="route-destination">
                  Vers {route.refuge_name || (selectedRefuge && selectedRefuge.name) || ''}
                </div>
                <div className="route-stats">
                  <div className="route-stat">
                    <i className="bi bi-signpost-2-fill"></i>
                    {route.total_distance_km || route.distance_km} km
                  </div>
                  <div className="route-stat">
                    <i className="bi bi-clock-fill"></i>
                    {route.estimated_time_minutes} min
                  </div>
                  <div className="route-stat" style={{ color: '#2e7d32' }}>
                    <i className="bi bi-shield-fill-check"></i>
                    Sûr
                  </div>
                </div>
              </div>
            )}

            {/* Liste des refuges */}
            <div className="sidebar-body">
              <RefugeList
                refuges={refuges}
                selectedId={selectedRefuge ? selectedRefuge.id : null}
                onSelect={handleSelectRefuge}
                onRoute={handleCalculateRoute}
              />
            </div>
          </div>
        )}

        {/* TOGGLE SIDEBAR */}
        <button
          className="sidebar-toggle"
          style={{ left: showSidebar ? '380px' : '0' }}
          onClick={() => setShowSidebar(!showSidebar)}
          title={showSidebar ? 'Masquer la liste' : 'Afficher la liste'}
        >
          <i className={`bi ${showSidebar ? 'bi-chevron-left' : 'bi-list'} fs-5`}></i>
        </button>

        {/* CARTE */}
        <MapView
          userPosition={position}
          refuges={refuges}
          dangerZones={dangerZones}
          route={route}
          selectedRefuge={selectedRefuge}
          onRefugeClick={handleSelectRefuge}
        />
      </div>

      {/* LOADING */}
      {loading && <LoadingSpinner message="Calcul de l'itinéraire sécurisé..." />}
    </div>
  )
}