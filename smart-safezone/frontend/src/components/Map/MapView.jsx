// src/components/Map/MapView.jsx
import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap
} from 'react-leaflet'
import L from 'leaflet'

// === FIX ICONES LEAFLET ===
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

// === ICONE UTILISATEUR ===
const userIcon = new L.DivIcon({
  html: '<div class="user-marker-icon"></div>',
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
})

// === ICONE REFUGE ===
function createRefugeIcon(refuge, isSelected) {
  const available = refuge.capacity - (refuge.current_occupancy || 0)
  const isFull = available <= 0
  const isLow = available > 0 && available < 50

  let colorClass = 'safe'
  if (isFull) colorClass = 'danger'
  else if (isLow || isSelected) colorClass = 'warning'

  return new L.DivIcon({
    html: `<div class="refuge-marker-icon ${colorClass}">🏠</div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  })
}

// === CENTRER LA CARTE ===
function CenterOnUser({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.setView([position.latitude, position.longitude], 14)
    }
  }, [position, map])
  return null
}

// === COULEURS ZONES DANGER ===
const severityColors = {
  1: '#ffb300',
  2: '#fb8c00',
  3: '#f44336',
  4: '#d32f2f',
  5: '#b71c1c'
}

// === COMPOSANT PRINCIPAL ===
export default function MapView({
  userPosition,
  refuges = [],
  dangerZones = [],
  route = null,
  selectedRefuge = null,
  onRefugeClick
}) {
  const center = userPosition
    ? [userPosition.latitude, userPosition.longitude]
    : [-18.91, 47.5255]

  return (
    <div className="leaflet-map-wrapper">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        {/* FOND DE CARTE */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* CENTRER */}
        {userPosition && <CenterOnUser position={userPosition} />}

        {/* MARQUEUR UTILISATEUR */}
        {userPosition && (
          <Marker position={[userPosition.latitude, userPosition.longitude]} icon={userIcon}>
            <Popup>
              <div>
                <p className="popup-title">
                  <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                  Votre position
                </p>
                <p className="small text-muted mb-0">
                  {userPosition.latitude.toFixed(4)}, {userPosition.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* MARQUEURS REFUGES */}
        {refuges.map((refuge) => {
          const available = refuge.capacity - (refuge.current_occupancy || 0)
          const isSelected = selectedRefuge && selectedRefuge.id === refuge.id

          return (
            <Marker
              key={refuge.id}
              position={[refuge.latitude, refuge.longitude]}
              icon={createRefugeIcon(refuge, isSelected)}
              eventHandlers={{
                click: () => onRefugeClick && onRefugeClick(refuge)
              }}
            >
              <Popup>
                <div style={{ minWidth: 200 }}>
                  <p className="popup-title mb-1">{refuge.name}</p>
                  <span className="badge bg-secondary mb-2 d-inline-block">{refuge.type}</span>

                  <div className="d-flex justify-content-between small mb-1">
                    <span>
                      <i className="bi bi-people-fill me-1"></i>Capacité
                    </span>
                    <strong>{refuge.capacity}</strong>
                  </div>

                  <div className="d-flex justify-content-between small mb-2">
                    <span>
                      <i className="bi bi-check-circle-fill me-1"></i>Disponible
                    </span>
                    <strong className={available > 0 ? 'text-success' : 'text-danger'}>
                      {available}
                    </strong>
                  </div>

                  <div className="d-flex gap-2 small">
                    {refuge.has_water && (
                      <span className="equip-water">
                        <i className="bi bi-droplet-fill"></i> Eau
                      </span>
                    )}
                    {refuge.has_electricity && (
                      <span className="equip-electric">
                        <i className="bi bi-lightning-fill"></i> Élec
                      </span>
                    )}
                    {refuge.has_medical && (
                      <span className="equip-medical">
                        <i className="bi bi-heart-pulse-fill"></i> Méd
                      </span>
                    )}
                  </div>

                  {refuge.distance_km !== undefined && (
                    <p className="small text-primary fw-bold mt-2 mb-0">
                      <i className="bi bi-signpost-2-fill me-1"></i>
                      {refuge.distance_km} km — {refuge.estimated_time_minutes} min
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

        {/* ZONES DANGEREUSES */}
        {dangerZones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={zone.radius}
            pathOptions={{
              color: severityColors[zone.severity] || '#f44336',
              fillColor: severityColors[zone.severity] || '#f44336',
              fillOpacity: 0.2,
              weight: 2,
              dashArray: '8, 6'
            }}
          >
            <Popup>
              <div>
                <p className="popup-title text-danger">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  {zone.name}
                </p>
                <p className="small mb-1">{zone.description}</p>
                <p className="small mb-0">
                  <strong>Sévérité : </strong>
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`bi bi-circle-fill me-1 ${
                        i < zone.severity ? 'text-danger' : 'text-light'
                      }`}
                      style={{ fontSize: '0.5rem' }}
                    ></i>
                  ))}
                </p>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* ITINÉRAIRE */}
        {route && route.path && route.path.length > 1 && (
          <Polyline
            positions={route.path.map((p) => [p.latitude, p.longitude])}
            pathOptions={{
              color: '#1565c0',
              weight: 6,
              opacity: 0.8,
              dashArray: '12, 8'
            }}
          />
        )}
      </MapContainer>
    </div>
  )
}