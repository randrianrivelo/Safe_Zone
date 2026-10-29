import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { shelterService } from '../../services/shelterService'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Configuration des icônes Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl, shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41]
})

// Position par défaut (Antananarivo centre)
// Cette position ne sera utilisée que si la géolocalisation échoue
const DEFAULT_CENTER = [-18.9070, 47.5350]

// ============================================================
// LES 10 DISTRICTS D'ANALAMANGA
// ============================================================
const ANALAMANGA_DISTRICTS = [
  { id: 1, name: 'Antananarivo Renivohitra' },
  { id: 2, name: 'Antananarivo Atsimondrano' },
  { id: 3, name: 'Antananarivo Avaradrano' },
  { id: 4, name: 'Ambohidratrimo' },
  { id: 5, name: 'Manjakandriana' },
  { id: 6, name: 'Andramasina' },
  { id: 7, name: 'Anjozorobe' },
  { id: 8, name: 'Ankazobe' },
  { id: 9, name: 'Arivonimamo' },
  { id: 10, name: 'Ambatolampy' }
]

// Zones dangereuses (Analamanga)
const DANGERS = [
  { name: 'Plaine Sisaony', lat: -18.9750, lon: 47.4950, radius: 3500, severity: 'critique', color: '#ff3b30' },
  { name: 'Berges Ikopa', lat: -18.9600, lon: 47.4870, radius: 2800, severity: 'eleve', color: '#ff9500' },
  { name: 'Bas-fond Mamba', lat: -18.9820, lon: 47.5080, radius: 2000, severity: 'eleve', color: '#ff9500' },
  { name: 'Isotry', lat: -18.9300, lon: 47.5200, radius: 1500, severity: 'eleve', color: '#ff9500' },
  { name: 'Plaine Tongoloina', lat: -18.9450, lon: 47.5350, radius: 2500, severity: 'critique', color: '#ff3b30' }
]

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

async function getOSRMRoute(start, end) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/`
      + `${start[1]},${start[0]};${end[1]},${end[0]}`
      + `?overview=full&geometries=geojson&steps=true`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      const route = data.routes[0]
      const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
      const distance = (route.distance / 1000).toFixed(1)
      const duration = Math.round(route.duration / 60)
      return {
        coords,
        distance_km: parseFloat(distance),
        duration_min: duration,
        duration_walk: Math.round((parseFloat(distance) / 5) * 60)
      }
    }
    return null
  } catch (err) {
    console.error('OSRM Error:', err)
    return null
  }
}

// ============================================================
// COMPOSANTS DE CARTE
// ============================================================
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position && position.length === 2) {
      map.flyTo(position, 14, { duration: 1.5 })
    }
  }, [position, map])
  return null
}

function FitRoute({ route }) {
  const map = useMap()
  useEffect(() => {
    if (route && route.length > 1) {
      const bounds = L.latLngBounds(route)
      map.fitBounds(bounds, { padding: [60, 60], duration: 1 })
    }
  }, [route, map])
  return null
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function MapPage() {
  const { theme } = useThemeStore()
  const [shelters, setShelters] = useState([])
  const [userPos, setUserPos] = useState(null)
  const [locationStatus, setLocationStatus] = useState('loading') // loading, success, error
  const [route, setRoute] = useState([])
  const [routeInfo, setRouteInfo] = useState(null)
  const [selectedShelter, setSelectedShelter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('normal')
  const [showDangers, setShowDangers] = useState(true)
  const [showPanel, setShowPanel] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  // ============================================================
  // GÉOLOCALISATION - VERSION CORRIGÉE
  // ============================================================
  const locateUser = () => {
    setLocationStatus('loading')

    if (!navigator.geolocation) {
      console.error('Geolocation not supported')
      setLocationStatus('error')
      setUserPos(DEFAULT_CENTER)
      return
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude
        console.log('Real position detected:', lat, lon)
        setLocationStatus('success')
        setUserPos([lat, lon])
      },
      (error) => {
        console.error('Geolocation error:', error.message)
        setLocationStatus('error')

        let errorMsg = ''
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = fr ? 'Permission refusee - Activez la localisation' : 'Nolavina ny fahazoan-dalana'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = fr ? 'Position indisponible' : 'Tsy hita ny toerana'
            break
          case error.TIMEOUT:
            errorMsg = fr ? 'Delai depasse - Reessayez' : 'Lasa ny fotoana - Andramo indray'
            break
          default:
            errorMsg = fr ? 'Erreur de localisation' : 'Olana amin\'ny localization'
        }
        console.warn(errorMsg)
        setUserPos(DEFAULT_CENTER)
      },
      options
    )
  }

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadShelters()
    locateUser()
  }, [theme])

  const loadShelters = async () => {
    try {
      const data = await shelterService.getAll()
      console.log('Shelters loaded:', data.length)
      setShelters(data)
    } catch (err) {
      console.error('Error loading shelters:', err)
      setShelters([])
    }
  }

  const refreshLocation = () => {
    setUserPos(null)
    locateUser()
  }

  // ============================================================
  // SCORE ET ITINÉRAIRE
  // ============================================================
  const scoreShelter = (shelter, userLat, userLon) => {
    const dist = haversine(userLat, userLon, shelter.latitude, shelter.longitude)
    const capPct = shelter.capacity_total > 0
      ? (shelter.capacity_total - shelter.current_occupancy) / shelter.capacity_total
      : 0
    const score = (
      10 * Math.max(0, 1 - dist / 30) +
      9 * capPct +
      8 * (shelter.has_water ? 1 : 0) +
      7 * (shelter.has_medical ? 1 : 0) +
      5 * (shelter.has_electricity ? 1 : 0) +
      3 * (shelter.has_food ? 1 : 0)
    )
    const maxScore = 10 + 9 + 8 + 7 + 5 + 3
    return {
      score: Math.round((score / maxScore) * 100),
      distance_km: Math.round(dist * 10) / 10
    }
  }

  const findBestShelter = async () => {
    if (!userPos) {
      alert(fr ? 'Position GPS non disponible' : 'Tsy hita ny GPS')
      refreshLocation()
      return
    }
    setLoading(true)
    try {
      const available = shelters.filter(s => s.status === 'ouvert')
      if (available.length === 0) {
        alert(fr ? 'Aucun refuge disponible' : 'Tsy misy toerana')
        setLoading(false)
        return
      }
      const scored = available.map(s => ({
        shelter: s,
        ...scoreShelter(s, userPos[0], userPos[1])
      }))

      if (mode === 'urgence') {
        scored.sort((a, b) => a.distance_km - b.distance_km)
      } else {
        scored.sort((a, b) => b.score - a.score)
      }

      const best = scored[0]
      const osrmResult = await getOSRMRoute(userPos, [best.shelter.latitude, best.shelter.longitude])

      if (osrmResult) {
        setRoute(osrmResult.coords)
        setRouteInfo({
          shelter: best.shelter,
          score: best.score,
          distance_km: osrmResult.distance_km,
          duration_min: osrmResult.duration_min,
          duration_walk: osrmResult.duration_walk,
          algorithm: mode === 'urgence' ? 'A*' : 'Dijkstra',
          alternatives: scored.slice(1, 4).map(s => ({
            name: s.shelter.name,
            score: s.score,
            dist_km: s.distance_km
          }))
        })
        setSelectedShelter(best.shelter)
        saveRouteToHistory(best.shelter.name, best.shelter.id, osrmResult.distance_km, osrmResult.duration_min)
      } else {
        alert(fr ? 'Impossible de calculer l\'itineraire' : 'Tsy afaka manisa ny lalana')
      }
    } catch (err) {
      console.error(err)
      alert(fr ? 'Erreur de calcul' : 'Olana manisa')
    } finally {
      setLoading(false)
    }
  }

  const goToShelter = async (shelter) => {
    if (!userPos) {
      alert(fr ? 'Position GPS non disponible' : 'Tsy hita ny GPS')
      refreshLocation()
      return
    }
    setLoading(true)
    try {
      const osrmResult = await getOSRMRoute(userPos, [shelter.latitude, shelter.longitude])
      if (osrmResult) {
        const { score } = scoreShelter(shelter, userPos[0], userPos[1])
        setRoute(osrmResult.coords)
        setRouteInfo({
          shelter: shelter,
          score: score,
          distance_km: osrmResult.distance_km,
          duration_min: osrmResult.duration_min,
          duration_walk: osrmResult.duration_walk,
          algorithm: mode === 'urgence' ? 'A*' : 'Dijkstra'
        })
        setSelectedShelter(shelter)
        saveRouteToHistory(shelter.name, shelter.id, osrmResult.distance_km, osrmResult.duration_min)
      } else {
        alert(fr ? 'Impossible de calculer l\'itineraire' : 'Tsy afaka manisa ny lalana')
      }
    } catch (err) {
      console.error(err)
      alert(fr ? 'Erreur itineraire' : 'Olana lalana')
    } finally {
      setLoading(false)
    }
  }

  const saveRouteToHistory = (shelterName, shelterId, distanceKm, durationMin) => {
    const savedRoutes = localStorage.getItem('route_history')
    const routes = savedRoutes ? JSON.parse(savedRoutes) : []
    routes.unshift({
      shelter_name: shelterName,
      shelter_id: shelterId,
      distance_km: distanceKm,
      duration_min: durationMin,
      timestamp: new Date().toISOString()
    })
    if (routes.length > 50) routes.pop()
    localStorage.setItem('route_history', JSON.stringify(routes))
  }

  const clearRoute = () => {
    setRoute([])
    setRouteInfo(null)
    setSelectedShelter(null)
  }

  // ============================================================
  // ICÔNES AVEC BOOTSTRAP ICONS
  // ============================================================
  const shelterIcon = (s) => {
    const pct = s.capacity_total ? (s.current_occupancy / s.capacity_total) * 100 : 0
    const color = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
    return L.divIcon({
      className: '',
      html: `<div style="
        width: 14px; height: 14px;
        background: ${color};
        border-radius: 50%;
        border: 2px solid ${theme === 'dark' ? '#0b1023' : '#ffffff'};
        box-shadow: 0 0 8px ${color};
      "></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    })
  }

  const userIcon = L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px;
      background: #38bdf8;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 12px rgba(56,189,248,0.8);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })

  const selectedIcon = L.divIcon({
    className: '',
    html: `<div style="
      width: 20px; height: 20px;
      background: #a855f7;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 0 16px rgba(168,85,247,0.8);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  // ============================================================
  // FILTRES
  // ============================================================
  const filteredShelters = shelters.filter(shelter => {
    const matchSearch = !searchTerm ||
      shelter.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = filterType === 'all' ||
      (filterType === 'open' && shelter.status === 'ouvert') ||
      (filterType === 'saturated' && shelter.status === 'sature')

    const matchDistrict = selectedDistrict === 'all' ||
      String(shelter.district_id) === selectedDistrict

    return matchSearch && matchStatus && matchDistrict
  })

  const clearAllFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setSelectedDistrict('all')
  }

  const tileKey = theme === 'dark' ? 'dark' : 'light'
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  // ============================================================
  // RENDU
  // ============================================================
  return (
    <div className="mappage">
      <Navbar />
      <div className="mappage__container">

        {/* PANEL LATERAL */}
        <div className={`mappage__panel ${showPanel ? '' : 'mappage__panel--hidden'}`}>

          {/* FILTRES */}
          <div className="mappage__filters">
            <div className="mappage__filter-group">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder={fr ? "Rechercher un refuge..." : "Mitady toerana..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mappage__filter-search"
              />
            </div>

            <select
              className="mappage__filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">{fr ? "Tous les refuges" : "Toerana rehetra"}</option>
              <option value="open">{fr ? "Refuges ouverts" : "Misokatra"}</option>
              <option value="saturated">{fr ? "Refuges satures" : "Feno"}</option>
            </select>

            <select
              className="mappage__filter-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="all">{fr ? "Tous les districts" : "Distrika rehetra"}</option>
              {ANALAMANGA_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <div className="mappage__filter-count">
              {filteredShelters.length} / {shelters.length} {fr ? 'refuges' : 'toerana'}
            </div>
          </div>

          {/* FILTRES ACTIFS */}
          {(searchTerm || filterType !== 'all' || selectedDistrict !== 'all') && (
            <div className="mappage__active-filters">
              <span>{fr ? 'Filtres actifs :' : 'Filtres mavitrika :'}</span>
              {searchTerm && <span className="mappage__active-filter"><i className="bi bi-search"></i> {searchTerm}</span>}
              {filterType !== 'all' && (
                <span className="mappage__active-filter">
                  {filterType === 'open' ? (fr ? 'Ouverts' : 'Misokatra') : (fr ? 'Satures' : 'Feno')}
                </span>
              )}
              {selectedDistrict !== 'all' && (
                <span className="mappage__active-filter">
                  <i className="bi bi-geo-alt"></i> {ANALAMANGA_DISTRICTS.find(d => String(d.id) === selectedDistrict)?.name}
                </span>
              )}
              <button className="mappage__clear-filters" onClick={clearAllFilters}>
                <i className="bi bi-x-circle"></i> {fr ? 'Effacer' : 'Hamafa'}
              </button>
            </div>
          )}

          {/* MODE */}
          <div className="mappage__mode">
            <button className={`mappage__mode-btn ${mode === 'normal' ? 'active' : ''}`} onClick={() => setMode('normal')}>
              <i className="bi bi-compass"></i> {fr ? 'Normal' : 'Ara-dalana'}
              <span className="mappage__mode-algo">Dijkstra</span>
            </button>
            <button className={`mappage__mode-btn mappage__mode-btn--urgence ${mode === 'urgence' ? 'active' : ''}`} onClick={() => setMode('urgence')}>
              <i className="bi bi-lightning-charge-fill"></i> {fr ? 'Urgence' : 'Maika'}
              <span className="mappage__mode-algo">A*</span>
            </button>
          </div>

          {/* ACTIONS */}
          <div className="mappage__actions">
            <button className="mappage__action-primary" onClick={findBestShelter} disabled={loading}>
              {loading ? <><div className="spinner-sm"></div> {fr ? 'Calcul...' : 'Manisa...'}</> : <><i className="bi bi-sign-turn-right"></i> {fr ? 'Meilleur refuge' : 'Toerana tsara'}</>}
            </button>
            <button className="mappage__action-secondary" onClick={refreshLocation}>
              <i className="bi bi-crosshair"></i> {fr ? 'Ma position' : 'Ny toerako'}
              {locationStatus === 'loading' && <span className="mappage__status-dot loading"></span>}
              {locationStatus === 'error' && <span className="mappage__status-dot error"></span>}
            </button>
            {route.length > 0 && (
              <button className="mappage__action-clear" onClick={clearRoute}>
                <i className="bi bi-x-circle"></i> {fr ? 'Effacer' : 'Esory'}
              </button>
            )}
          </div>

          {/* ITINERAIRE */}
          {routeInfo && (
            <div className="mappage__route-info">
              <h4><i className="bi bi-sign-turn-right"></i> {fr ? 'Itineraire' : 'Lalana'}</h4>
              <div className="mappage__route-detail">
                <span><i className="bi bi-building"></i> {routeInfo.shelter.name}</span>
                <span><i className="bi bi-signpost"></i> {routeInfo.distance_km} km</span>
                <span><i className="bi bi-car-front"></i> {routeInfo.duration_min} min</span>
                <span><i className="bi bi-person-walking"></i> {routeInfo.duration_walk} min</span>
                <span><i className="bi bi-cpu"></i> {routeInfo.algorithm}</span>
                <span><i className="bi bi-star-fill"></i> Score: {routeInfo.score}/100</span>
              </div>
              {routeInfo.alternatives && routeInfo.alternatives.length > 0 && (
                <div className="mappage__route-alts">
                  <span className="mappage__route-alts-title">{fr ? 'Alternatives :' : 'Safidy hafa :'}</span>
                  {routeInfo.alternatives.map((alt, i) => (
                    <div key={i} className="mappage__route-alt">
                      <span>{alt.name}</span>
                      <span className="mappage__route-alt-score">{alt.dist_km} km • {alt.score}/100</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TOGGLE DANGERS */}
          <div className="mappage__toggles">
            <label className="mappage__toggle">
              <input type="checkbox" checked={showDangers} onChange={() => setShowDangers(!showDangers)} />
              <span><i className="bi bi-exclamation-triangle"></i> {fr ? 'Zones dangereuses' : 'Toerana mampidi-doza'}</span>
            </label>
          </div>

          {/* LISTE DES REFUGES FILTRES */}
          <div className="mappage__shelter-list">
            <h4><i className="bi bi-building"></i> {fr ? 'Refuges' : 'Toerana'} ({filteredShelters.length})</h4>
            {filteredShelters.slice(0, 30).map((s, i) => {
              const pct = s.capacity_total ? Math.round((s.current_occupancy / s.capacity_total) * 100) : 0
              const clr = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
              const districtName = ANALAMANGA_DISTRICTS.find(d => d.id === s.district_id)?.name || (fr ? 'District inconnu' : 'Distrika tsy fantatra')
              return (
                <div key={i} className="mappage__shelter-item" onClick={() => goToShelter(s)}>
                  <div className="mappage__shelter-dot" style={{ background: clr }}></div>
                  <div className="mappage__shelter-info">
                    <strong>{s.name}</strong>
                    <span style={{ color: clr }}>{s.current_occupancy}/{s.capacity_total} ({pct}%)</span>
                    <span className="mappage__shelter-district"><i className="bi bi-geo-alt"></i> {districtName}</span>
                  </div>
                  <i className="bi bi-chevron-right"></i>
                </div>
              )
            })}
            {filteredShelters.length === 0 && (
              <div className="mappage__shelter-empty">
                <i className="bi bi-building-slash"></i>
                <span>{fr ? 'Aucun refuge trouve' : 'Tsy misy toerana hita'}</span>
              </div>
            )}
          </div>
        </div>

        {/* BOUTON TOGGLE PANEL */}
        <button className="mappage__toggle-panel" onClick={() => setShowPanel(!showPanel)}>
          <i className={`bi bi-chevron-${showPanel ? 'left' : 'right'}`}></i>
        </button>

        {/* CARTE */}
        <div className="mappage__map">
          <MapContainer key={`map-${tileKey}`} center={DEFAULT_CENTER} zoom={12} style={{ width: '100%', height: '100%' }}>
            <TileLayer key={tileKey} url={tileUrl} attribution='&copy; CARTO' />

            {userPos && !route.length && <RecenterMap position={userPos} />}
            {route.length > 0 && <FitRoute route={route} />}

            {userPos && (
              <Marker position={userPos} icon={userIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
                    <strong><i className="bi bi-crosshair"></i> {fr ? 'Ma position' : 'Ny toerako'}</strong>
                    <br />
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{userPos[0].toFixed(4)}, {userPos[1].toFixed(4)}</span>
                    {locationStatus === 'error' && (
                      <div style={{ color: '#ff3b30', fontSize: '0.7rem', marginTop: '4px' }}>
                        <i className="bi bi-exclamation-triangle"></i> {fr ? 'Position par defaut' : 'Toerana mahazatra'}
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {filteredShelters.map((s, i) => (
              <Marker
                key={i}
                position={[s.latitude, s.longitude]}
                icon={selectedShelter?.id === s.id ? selectedIcon : shelterIcon(s)}
              >
                <Popup>
                  <div className="mappage__popup">
                    <strong>{s.name}</strong>
                    <span className="mappage__popup-cap">{s.current_occupancy}/{s.capacity_total}</span>
                    <span className="mappage__popup-status" style={{ color: s.status === 'ouvert' ? '#39ff88' : '#ff9500' }}>
                      {s.status === 'ouvert' ? (fr ? 'Disponible' : 'Misy') : (fr ? 'Sature' : 'Feno')}
                    </span>
                    <div className="mappage__popup-services">
                      {s.has_water && <span title="Eau"><i className="bi bi-droplet-fill" style={{ color: '#38bdf8' }}></i></span>}
                      {s.has_electricity && <span title="Electricite"><i className="bi bi-lightning-fill" style={{ color: '#ffd60a' }}></i></span>}
                      {s.has_medical && <span title="Medical"><i className="bi bi-heart-pulse-fill" style={{ color: '#ff3b30' }}></i></span>}
                      {s.has_food && <span title="Nourriture"><i className="bi bi-cup-hot-fill" style={{ color: '#ff9500' }}></i></span>}
                    </div>
                    <button className="mappage__popup-btn" onClick={() => goToShelter(s)}>
                      <i className="bi bi-sign-turn-right"></i> {fr ? 'Itineraire' : 'Lalana'}
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showDangers && DANGERS.map((z, i) => (
              <Circle
                key={i}
                center={[z.lat, z.lon]}
                radius={z.radius}
                pathOptions={{
                  color: z.color,
                  fillColor: z.color,
                  fillOpacity: theme === 'dark' ? 0.15 : 0.08,
                  weight: 1.5,
                  dashArray: '5 5'
                }}
              >
                <Popup>
                  <strong style={{ color: z.color }}><i className="bi bi-exclamation-triangle-fill"></i> {z.name}</strong><br />
                  <span>{z.severity}</span>
                </Popup>
              </Circle>
            ))}

            {route.length > 0 && (
              <Polyline
                positions={route}
                pathOptions={{
                  color: mode === 'urgence' ? '#39ff88' : '#a855f7',
                  weight: 5,
                  opacity: 0.9,
                  dashArray: mode === 'urgence' ? '12 6' : null
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  )
}