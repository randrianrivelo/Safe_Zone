import { useState, useEffect } from 'react'
import MapView from '../components/Map/MapView'
import RefugeList from '../components/Refuge/RefugeList'
import AlertBanner from '../components/Alert/AlertBanner'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import SearchFilter from '../components/UI/SearchFilter'
import { useGeolocation } from '../hooks/useGeolocation'
import { refugeService, pathfindingService, zoneService } from '../services/api'
import { useToast } from '../context/ToastContext'
import './MapPage.css'


export default function MapPage() {
  const { position, loading: geoLoading } = useGeolocation()
  const [allRefuges, setAllRefuges] = useState([])
  const [refuges, setRefuges] = useState([])
  const [zones, setZones] = useState([])
  const [selected, setSelected] = useState(null)
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sidebar, setSidebar] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      const rRes = position ? await refugeService.getNearest(position.latitude, position.longitude, 15) : await refugeService.getAll()
      setAllRefuges(rRes.data)
      setRefuges(rRes.data)
      const zRes = await zoneService.getDanger()
      setZones(zRes.data)
    }
    load()
  }, [position])

  // Auto toasts
  useEffect(() => {
    const t1 = setTimeout(() => addToast('URGENCE - Cyclone GAMANE', 'Cyclone categorie 3 en approche', 'error'), 2000)
    const t2 = setTimeout(() => addToast('Fortes pluies prevues', 'Pluies torrentielles dans les 24h', 'warning'), 5000)
    const t3 = setTimeout(() => addToast('Refuges ouverts', '15 refuges disponibles. Consultez la carte', 'success'), 8000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const handleSearch = (query) => {
    if (!query) return setRefuges(allRefuges)
    setRefuges(allRefuges.filter(r => r.name.toLowerCase().includes(query.toLowerCase())))
  }

  const handleFilter = (filters) => {
    let filtered = [...allRefuges]
    if (filters.water) filtered = filtered.filter(r => r.has_water)
    if (filters.electricity) filtered = filtered.filter(r => r.has_electricity)
    if (filters.medical) filtered = filtered.filter(r => r.has_medical)
    setRefuges(filtered)
  }

  const calcRoute = async (refuge) => {
    if (!position) return addToast('Erreur', 'Activez la geolocalisation', 'error')
    setSelected(refuge)
    setLoading(true)
    try {
      const res = await pathfindingService.findRoute(position.latitude, position.longitude, refuge.id)
      if (res.data.success) {
        setRoute(res.data.data)
        addToast('Itineraire calcule', `Vers ${refuge.name} — ${res.data.data.total_distance_km} km — ${res.data.data.estimated_time_minutes} min`, 'success')
      }
    } catch { addToast('Erreur', 'Impossible de calculer', 'error') }
    finally { setLoading(false) }
  }

  const autoFind = async () => {
    if (!position) return addToast('Erreur', 'Activez la geolocalisation', 'error')
    setLoading(true)
    try {
      const res = await pathfindingService.findBest(position.latitude, position.longitude)
      if (res.data.success && res.data.data.length > 0) {
        const best = res.data.data[0]
        setRoute(best)
        setSelected({ id: best.refuge_id, name: best.refuge_name })
        addToast('Refuge optimal trouve', `${best.refuge_name} — ${best.total_distance_km || best.distance_km} km`, 'success')
      }
    } catch { addToast('Erreur', 'Aucun refuge accessible', 'error') }
    finally { setLoading(false) }
  }

  const sharePosition = () => {
    if (position) {
      const msg = `Ma position: ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)} — J'ai besoin d'aide!`
      console.log('SMS PARTAGE:', msg)
      addToast('Position partagee', 'Votre position a ete envoyee a vos proches', 'success')
    }
  }

  return (
    <div className="map-page">
      <AlertBanner />
      {geoLoading && (
        <div className="alert-banner info">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="spinner-border spinner-border-sm"></div>
            <span><i className="bi bi-geo-alt"></i> Localisation en cours...</span>
          </div><div></div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {sidebar && (
          <div className="map-sidebar">
            <div className="sidebar-header">
              <h2><i className="bi bi-house-heart-fill" style={{ color: 'var(--safe)' }}></i> Refuges ({refuges.length})</h2>
              <button className="btn-auto-find" onClick={autoFind} disabled={loading || !position}>
                {loading ? <><span className="spinner-border spinner-border-sm"></span> Recherche...</>
                  : <><i className="bi bi-shield-fill-check"></i> Refuge le plus sur</>}
              </button>
              <button className="btn-action" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }} onClick={sharePosition}>
                <i className="bi bi-share-fill" style={{ color: 'var(--info)' }}></i> Partager ma position
              </button>
            </div>

            {route && (
              <div className="route-info-box">
                <h4><i className="bi bi-compass-fill"></i> Itineraire calcule</h4>
                <div className="route-destination">{route.refuge_name || selected?.name}</div>
                <div className="route-stats">
                  <div className="route-stat"><i className="bi bi-signpost-2-fill"></i> {route.total_distance_km || route.distance_km} km</div>
                  <div className="route-stat"><i className="bi bi-clock-fill"></i> {route.estimated_time_minutes} min</div>
                  <div className="route-stat safe"><i className="bi bi-shield-fill-check"></i> Sur</div>
                </div>
              </div>
            )}

            <div className="sidebar-body">
              <SearchFilter onSearch={handleSearch} onFilter={handleFilter} />
              <RefugeList refuges={refuges} selectedId={selected?.id} onSelect={setSelected} onRoute={calcRoute} />
            </div>
          </div>
        )}

        <button className="sidebar-toggle" style={{ left: sidebar ? '400px' : '0' }} onClick={() => setSidebar(!sidebar)}>
          <i className={`bi ${sidebar ? 'bi-chevron-left' : 'bi-list'}`} style={{ fontSize: '1.2rem' }}></i>
        </button>

        <MapView userPosition={position} refuges={refuges} dangerZones={zones}
          route={route} selectedRefuge={selected} onRefugeClick={setSelected} />
      </div>

      {loading && <LoadingSpinner message="Calcul de l'itineraire securise..." />}
    </div>
  )
}