import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
})

const userIcon = new L.DivIcon({ html: '<div class="user-marker-icon"></div>', className: '', iconSize: [22, 22], iconAnchor: [11, 11] })

function refugeIcon(r, sel) {
  const avail = r.capacity - (r.current_occupancy || 0)
  let c = 'safe'
  if (avail <= 0) c = 'danger'
  else if (avail < 50 || sel) c = 'warning'
  return new L.DivIcon({ html: `<div class="refuge-marker-icon ${c}">🏠</div>`, className: '', iconSize: [36, 36], iconAnchor: [18, 18] })
}

function CenterMap({ pos }) {
  const map = useMap()
  useEffect(() => { if (pos) map.setView([pos.latitude, pos.longitude], 14) }, [pos, map])
  return null
}

const colors = { 1: '#f59e0b', 2: '#fb923c', 3: '#ef4444', 4: '#dc2626', 5: '#991b1b' }

export default function MapView({ userPosition, refuges = [], dangerZones = [], route = null, selectedRefuge = null, onRefugeClick }) {
  const center = userPosition ? [userPosition.latitude, userPosition.longitude] : [-18.91, 47.5255]

  return (
    <div className="map-wrapper">
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
        />

        {userPosition && <CenterMap pos={userPosition} />}

        {userPosition && (
          <Marker position={[userPosition.latitude, userPosition.longitude]} icon={userIcon}>
            <Popup><div className="popup-title"><i className="bi bi-geo-alt-fill" style={{ color: 'var(--primary)' }}></i> Votre position</div></Popup>
          </Marker>
        )}

        {refuges.map(r => (
          <Marker key={r.id} position={[r.latitude, r.longitude]} icon={refugeIcon(r, selectedRefuge?.id === r.id)} eventHandlers={{ click: () => onRefugeClick?.(r) }}>
            <Popup>
              <div style={{ minWidth: 200 }}>
                <p className="popup-title">{r.name}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Capacite</span><strong style={{ color: 'var(--text-primary)' }}>{r.capacity}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Disponible</span><strong style={{ color: (r.capacity - r.current_occupancy) > 0 ? 'var(--safe)' : 'var(--danger)' }}>{r.capacity - (r.current_occupancy || 0)}</strong>
                </div>
                {r.distance_km !== undefined && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginTop: 8 }}>
                    <i className="bi bi-signpost-2-fill"></i> {r.distance_km} km — {r.estimated_time_minutes} min
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {dangerZones.map(z => (
          <Circle key={z.id} center={[z.latitude, z.longitude]} radius={z.radius}
            pathOptions={{ color: colors[z.severity] || '#ef4444', fillColor: colors[z.severity] || '#ef4444', fillOpacity: 0.15, weight: 2, dashArray: '8,6' }}>
            <Popup>
              <div className="popup-title" style={{ color: 'var(--danger)' }}>
                <i className="bi bi-exclamation-triangle-fill"></i> {z.name}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{z.description}</p>
            </Popup>
          </Circle>
        ))}

        {route?.path?.length > 1 && (
          <Polyline positions={route.path.map(p => [p.latitude, p.longitude])}
            pathOptions={{ color: '#6366f1', weight: 5, opacity: 0.8, dashArray: '10,8' }} />
        )}
      </MapContainer>
    </div>
  )
}