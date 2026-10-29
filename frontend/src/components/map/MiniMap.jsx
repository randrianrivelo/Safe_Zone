import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { useThemeStore } from '../../stores/themeStore'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl, shadowUrl,
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [0, -33]
})
L.Marker.prototype.options.icon = defaultIcon

const SAMPLE_SHELTERS = [
  { id: 1, name: 'Stade Mahamasina', lat: -18.9193, lon: 47.5364, status: 'ouvert' },
  { id: 2, name: 'Gymnase Antsonjombe', lat: -18.9050, lon: 47.5280, status: 'ouvert' },
  { id: 5, name: 'Palais des Sports', lat: -18.9155, lon: 47.5340, status: 'ouvert' },
  { id: 9, name: 'Centre Anosizato', lat: -18.9650, lon: 47.4980, status: 'ouvert' },
  { id: 11, name: 'Centre Tanjombato', lat: -18.9780, lon: 47.5150, status: 'ouvert' },
  { id: 19, name: 'Centre Sabotsy Namehana', lat: -18.8430, lon: 47.5760, status: 'ouvert' },
  { id: 26, name: 'Centre Ambohidratrimo', lat: -18.7880, lon: 47.4350, status: 'ouvert' },
  { id: 44, name: 'Campus Ankatso', lat: -18.9010, lon: 47.5330, status: 'ouvert' },
  { id: 51, name: 'Zone Refuge Ivato', lat: -18.7970, lon: 47.4790, status: 'ouvert' },
  { id: 31, name: 'Centre Manjakandriana', lat: -18.9200, lon: 47.7870, status: 'ouvert' }
]

const DANGER_ZONES = [
  { name: 'Sisaony', lat: -18.9750, lon: 47.4950, radius: 3500 },
  { name: 'Ikopa', lat: -18.9600, lon: 47.4870, radius: 2800 },
  { name: 'Isotry', lat: -18.9300, lon: 47.5200, radius: 1500 }
]

const CENTER = [-18.9137, 47.5361]

export default function MiniMap() {
  const { theme } = useThemeStore()
  const tileKey = theme === 'dark' ? 'dark' : 'light'
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const shelterIcon = (status) => L.divIcon({
    className: '',
    html: `<div style="
      width: 14px; height: 14px;
      background: ${status === 'ouvert' ? '#39ff88' : '#ff9500'};
      border-radius: 50%;
      border: 2px solid ${theme === 'dark' ? '#0b1023' : '#ffffff'};
      box-shadow: 0 0 8px ${status === 'ouvert' ? 'rgba(57,255,136,0.7)' : 'rgba(255,149,0,0.7)'};
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  })

  return (
    <MapContainer
      key={`map-${tileKey}`}
      center={CENTER}
      zoom={10}
      scrollWheelZoom={false}
      dragging={true}
      zoomControl={true}
      doubleClickZoom={false}
      touchZoom={false}
      style={{
        width: '100%',
        height: '420px',
        borderRadius: '16px',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
        boxShadow: theme === 'dark' ? '0 8px 32px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <TileLayer key={tileKey} url={tileUrl} attribution='&copy; <a href="https://carto.com">CARTO</a>' />
      {SAMPLE_SHELTERS.map(s => (
        <Marker key={s.id} position={[s.lat, s.lon]} icon={shelterIcon(s.status)}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', lineHeight: 1.5, minWidth: 120 }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>{s.name}</strong>
              <span style={{ color: s.status === 'ouvert' ? '#22c55e' : '#f97316', fontWeight: 700, fontSize: '0.8rem' }}>
                {s.status === 'ouvert' ? '● Disponible' : '● Saturé'}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
      {DANGER_ZONES.map((z, i) => (
        <Circle key={i} center={[z.lat, z.lon]} radius={z.radius} pathOptions={{
          color: '#ff3b30',
          fillColor: '#ff3b30',
          fillOpacity: theme === 'dark' ? 0.15 : 0.08,
          weight: 1.5,
          dashArray: '5 5'
        }}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
              <strong style={{ color: '#ff3b30', display: 'block', marginBottom: 4 }}>⚠ Zone {z.name}</strong>
              Zone inondable active
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  )
}