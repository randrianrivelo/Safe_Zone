import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { shelterService } from '../../services/shelterService'
import { useGeolocation } from '../../hooks/useGeolocation'
import 'leaflet/dist/leaflet.css'
import './PublicMapPage.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

L.Marker.prototype.options.icon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41]
})

// Centre par défaut (Antananarivo)
const DEFAULT_CENTER = [-18.9137, 47.5361]

const DANGERS = [
  { name: 'Plaine Sisaony', lat: -18.9750, lon: 47.4950, radius: 3500, severity: 'critique', color: '#ff3b30' },
  { name: 'Berges Ikopa', lat: -18.9600, lon: 47.4870, radius: 2800, severity: 'eleve', color: '#ff9500' },
  { name: 'Bas-fond Mamba', lat: -18.9820, lon: 47.5080, radius: 2000, severity: 'eleve', color: '#ff9500' },
  { name: 'Isotry', lat: -18.9300, lon: 47.5200, radius: 1500, severity: 'eleve', color: '#ff9500' },
  { name: 'Plaine Tongoloina', lat: -18.9450, lon: 47.5350, radius: 2500, severity: 'critique', color: '#ff3b30' }
]

// Composant pour recentrer la carte
function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], 14, { duration: 1.5 })
    }
  }, [position, map])
  return null
}

export default function PublicMapPage() {
  const { theme } = useThemeStore()
  const { location, error, loading: geoLoading } = useGeolocation()
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    loadShelters()
  }, [])

  const loadShelters = async () => {
    setLoading(true)
    try {
      const data = await shelterService.getAll({ include_inactive: true })
      setShelters(data)
    } catch (err) {
      console.error('Erreur chargement refuges:', err)
      setShelters([])
    } finally {
      setLoading(false)
    }
  }

  const tileKey = theme === 'dark' ? 'dark' : 'light'
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  // Position de la carte (position réelle ou défaut)
  const mapCenter = location ? [location.lat, location.lng] : DEFAULT_CENTER

  const getShelterColor = (shelter) => {
    const pct = shelter.capacity_total ? (shelter.current_occupancy / shelter.capacity_total) * 100 : 0
    if (pct >= 90) return '#ff3b30'
    if (pct >= 50) return '#ff9500'
    return '#39ff88'
  }

  const getShelterStatus = (shelter) => {
    const pct = shelter.capacity_total ? (shelter.current_occupancy / shelter.capacity_total) * 100 : 0
    if (pct >= 90) return fr ? 'Saturé' : 'Feno'
    if (pct >= 50) return fr ? 'Occupation élevée' : 'Bep mpitroka'
    return fr ? 'Disponible' : 'Misy'
  }

  // Icône utilisateur personnalisée
  const userIcon = L.divIcon({
    className: 'user-marker',
    html: `<div style="
      width: 20px; height: 20px;
      background: #38bdf8;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 12px rgba(56,189,248,0.8);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  return (
    <div className="public-map">
      <Navbar />
      <main className="public-map__main">
        <div className="public-map__header">
          <div>
            <h1><i className="bi bi-map" /> {fr ? 'Carte publique' : 'Sarintany ho an\'ny rehetra'}</h1>
            <p>{fr ? 'Visualisez les refuges et zones dangereuses d\'Analamanga' : 'Jereo ny toerana fiarovana sy ny faritra mampidi-doza ao Analamanga'}</p>
          </div>
          <button className="public-map__login-btn" onClick={() => window.location.href = '/login'}>
            <i className="bi bi-box-arrow-in-right" /> {fr ? 'Se connecter' : 'Hiditra'}
          </button>
        </div>

        {/* Affichage de la position */}
        {geoLoading && (
          <div className="public-map__location-status">
            <i className="bi bi-compass" /> {fr ? 'Recherche de votre position...' : 'Mitady ny toeranao...'}
          </div>
        )}
        {error && (
          <div className="public-map__location-error">
            <i className="bi bi-exclamation-triangle-fill" /> {error} - {fr ? 'Position par défaut utilisée' : 'Toerana voafaritra ampiasaina'}
          </div>
        )}
        {location && !geoLoading && (
          <div className="public-map__location-success">
            <i className="bi bi-geo-alt-fill" /> {fr ? 'Position trouvée' : 'Toerana hita'} : {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </div>
        )}

        {loading ? (
          <div className="public-map__loading"><div className="spinner-lg" /></div>
        ) : (
          <>
            <div className="public-map__container">
              <MapContainer
                key={`map-${tileKey}`}
                center={mapCenter}
                zoom={13}
                style={{ width: '100%', height: '500px' }}
                className="public-map__map"
              >
                <TileLayer key={tileKey} url={tileUrl} attribution='&copy; CARTO' />

                {/* Recentrer la carte sur la position utilisateur */}
                {location && <RecenterMap position={location} />}

                {/* Marqueur de l'utilisateur */}
                {location && (
                  <Marker position={[location.lat, location.lng]} icon={userIcon}>
                    <Popup>
                      <div className="public-map__popup">
                        <strong>{fr ? 'Votre position' : 'Ny toeranao'}</strong>
                        <br />
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Refuges */}
                {shelters.map((s, i) => (
                  <Marker key={i} position={[s.latitude, s.longitude]}>
                    <Popup>
                      <div className="public-map__popup">
                        <strong>{s.name}</strong>
                        <span className="public-map__popup-cap">
                          {s.current_occupancy}/{s.capacity_total} places
                        </span>
                        <span className="public-map__popup-status" style={{ color: getShelterColor(s) }}>
                          {getShelterStatus(s)}
                        </span>
                        <button className="public-map__popup-btn" onClick={() => window.location.href = '/login'}>
                          <i className="bi bi-sign-turn-right" /> {fr ? 'Voir itinéraire' : 'Jereo lalana'}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Zones dangereuses */}
                {DANGERS.map((z, i) => (
                  <Circle
                    key={i}
                    center={[z.lat, z.lon]}
                    radius={z.radius}
                    pathOptions={{
                      color: z.color,
                      fillColor: z.color,
                      fillOpacity: 0.12,
                      weight: 1.5,
                      dashArray: '5 5'
                    }}
                  >
                    <Popup>
                      <strong style={{ color: z.color }}>⚠ {z.name}</strong>
                      <br />
                      <span>{z.severity}</span>
                    </Popup>
                  </Circle>
                ))}
              </MapContainer>
            </div>

            <div className="public-map__legend">
              <span>
                <span className="public-map__legend-dot" style={{ background: '#39ff88' }} />
                {fr ? 'Refuge disponible' : 'Toerana misy'}
              </span>
              <span>
                <span className="public-map__legend-dot" style={{ background: '#ff9500' }} />
                {fr ? 'Occupation élevée' : 'Bep mpitroka'}
              </span>
              <span>
                <span className="public-map__legend-dot" style={{ background: '#ff3b30' }} />
                {fr ? 'Refuge saturé' : 'Toerana feno'}
              </span>
              <span>
                <span className="public-map__legend-dot" style={{ background: '#ff3b30', border: '1px solid #ff3b30' }} />
                {fr ? 'Zone dangereuse' : 'Faritra mampidi-doza'}
              </span>
              <span>
                <span className="public-map__legend-dot" style={{ background: '#38bdf8' }} />
                {fr ? 'Votre position' : 'Ny toeranao'}
              </span>
            </div>
          </>
        )}
      </main>

      <style>{`
        .public-map__location-status {
          background: var(--accent-light);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-md);
          padding: 10px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--accent);
        }
        .public-map__location-error {
          background: rgba(255,59,48,0.1);
          border: 1px solid rgba(255,59,48,0.2);
          border-radius: var(--radius-md);
          padding: 10px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #ff3b30;
        }
        .public-map__location-success {
          background: rgba(57,255,136,0.1);
          border: 1px solid rgba(57,255,136,0.2);
          border-radius: var(--radius-md);
          padding: 10px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: #39ff88;
        }
      `}</style>
    </div>
  )
}