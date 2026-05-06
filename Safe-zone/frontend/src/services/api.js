// src/services/api.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
})

// ============================================================
// DONNÉES MOCKÉES — 15 REFUGES
// ============================================================
export const REFUGES_DATA = [
  { id: 1, name: 'Lycée JJ Rabe', lat: -18.8792, lng: 47.5079, capacity: 600, occupancy: 180, type: 'École', water: true, elec: true, med: false },
  { id: 2, name: 'Stade Alarobia', lat: -18.8833, lng: 47.5167, capacity: 2000, occupancy: 450, type: 'Stade', water: true, elec: true, med: true },
  { id: 3, name: 'Église Analakely', lat: -18.9000, lng: 47.5250, capacity: 300, occupancy: 60, type: 'Église', water: true, elec: true, med: false },
  { id: 4, name: 'Centre FJKM Ambatonakanga', lat: -18.9100, lng: 47.5300, capacity: 200, occupancy: 50, type: 'Centre', water: true, elec: false, med: false },
  { id: 5, name: 'Gymnase Ankorondrano', lat: -18.8700, lng: 47.5000, capacity: 450, occupancy: 120, type: 'Gymnase', water: true, elec: true, med: true },
  { id: 6, name: 'École Ambohijatovo', lat: -18.8850, lng: 47.5400, capacity: 250, occupancy: 80, type: 'École', water: true, elec: false, med: false },
  { id: 7, name: 'Hôpital HJRA', lat: -18.8950, lng: 47.5450, capacity: 120, occupancy: 120, type: 'Hôpital', water: true, elec: true, med: true },
  { id: 8, name: 'Palais Sports Mahamasina', lat: -18.8800, lng: 47.5200, capacity: 1500, occupancy: 400, type: 'Stade', water: true, elec: true, med: true },
  { id: 9, name: 'Collège Andohalo', lat: -18.9150, lng: 47.5350, capacity: 400, occupancy: 150, type: 'École', water: true, elec: true, med: false },
  { id: 10, name: 'Marché Isotry', lat: -18.9050, lng: 47.5100, capacity: 500, occupancy: 200, type: 'Centre', water: false, elec: true, med: false },
  { id: 11, name: 'Université Ankatso', lat: -18.8600, lng: 47.5050, capacity: 800, occupancy: 250, type: 'Université', water: true, elec: true, med: true },
  { id: 12, name: 'Centre Andavamamba', lat: -18.9250, lng: 47.5550, capacity: 180, occupancy: 90, type: 'Centre', water: true, elec: false, med: false },
  { id: 13, name: 'École Ampefiloha', lat: -18.8900, lng: 47.5150, capacity: 320, occupancy: 100, type: 'École', water: true, elec: true, med: false },
  { id: 14, name: 'Stade Analamahitsy', lat: -18.8500, lng: 47.4950, capacity: 750, occupancy: 180, type: 'Stade', water: true, elec: true, med: true },
  { id: 15, name: 'Chapelle Andranomena', lat: -18.9350, lng: 47.5600, capacity: 90, occupancy: 30, type: 'Église', water: true, elec: false, med: false }
]

export const METEO_DATA = [
  { province: 'Antananarivo', temp: 22, humidity: 75, wind: 35, precip: 45, risk: 'Cyclone GAMANE cat.3', riskLevel: 'critical', icon: 'bi-tornado', forecast: [22, 20, 18, 17, 19, 21, 23] },
  { province: 'Toamasina', temp: 28, humidity: 90, wind: 55, precip: 120, risk: 'Inondation sévère', riskLevel: 'critical', icon: 'bi-cloud-rain-heavy-fill', forecast: [28, 27, 26, 25, 26, 27, 28] },
  { province: 'Mahajanga', temp: 32, humidity: 65, wind: 20, precip: 10, risk: 'Aucun risque majeur', riskLevel: 'safe', icon: 'bi-sun-fill', forecast: [32, 33, 31, 30, 31, 32, 33] },
  { province: 'Fianarantsoa', temp: 19, humidity: 80, wind: 25, precip: 35, risk: 'Pluies modérées', riskLevel: 'warning', icon: 'bi-cloud-drizzle-fill', forecast: [19, 18, 17, 18, 19, 20, 19] },
  { province: 'Toliara', temp: 35, humidity: 40, wind: 15, precip: 2, risk: 'Sécheresse persistante', riskLevel: 'warning', icon: 'bi-brightness-high-fill', forecast: [35, 36, 34, 35, 36, 35, 34] },
  { province: 'Antsiranana', temp: 30, humidity: 70, wind: 40, precip: 55, risk: 'Vents forts', riskLevel: 'warning', icon: 'bi-wind', forecast: [30, 29, 28, 29, 30, 31, 30] }
]

// ============================================================
// SERVICES AVEC FALLBACK
// ============================================================
const fallback = (data) => ({ data })

export const refugeService = {
  getAll: async () => { try { return await API.get('/refuges/') } catch { return fallback(REFUGES_DATA.map(r => ({ ...r, available_spots: r.capacity - r.occupancy, is_full: r.occupancy >= r.capacity }))) } },
  getNearest: async (lat, lon, limit = 15) => { try { return await API.get(`/refuges/nearest?lat=${lat}&lon=${lon}&limit=${limit}`) } catch { return fallback(addDistances(REFUGES_DATA, lat, lon).slice(0, limit)) } },
  create: async (data) => { try { return await API.post('/refuges/', data) } catch { return fallback({ id: Date.now(), ...data }) } },
  update: async (id, data) => { try { return await API.put(`/refuges/${id}`, data) } catch { return fallback({ id, ...data }) } }
}

export const pathfindingService = {
  findRoute: async (sLat, sLon, refugeId) => {
    try { return await API.post('/pathfinding/route', { start_lat: sLat, start_lon: sLon, refuge_id: refugeId }) }
    catch {
      const r = REFUGES_DATA.find(x => x.id === refugeId)
      if (!r) return fallback({ success: false })
      const d = haversine(sLat, sLon, r.lat, r.lng)
      return fallback({ success: true, data: { path: buildPath(sLat, sLon, r.lat, r.lng), total_distance_km: Math.round(d * 100) / 100, estimated_time_minutes: Math.round((d / 4.5) * 60 * 10) / 10, refuge_name: r.name, refuge_id: r.id } })
    }
  },
  findBest: async (lat, lon) => {
    try { return await API.get(`/pathfinding/best-refuges?lat=${lat}&lon=${lon}`) }
    catch {
      const avail = addDistances(REFUGES_DATA.filter(r => r.occupancy < r.capacity), lat, lon)
      if (!avail.length) return fallback({ success: false, data: [] })
      const best = avail[0]
      return fallback({ success: true, data: [{ refuge_id: best.id, refuge_name: best.name, path: buildPath(lat, lon, best.lat, best.lng), total_distance_km: best.distance_km, estimated_time_minutes: best.time_min }] })
    }
  }
}

export const zoneService = {
  getDanger: async () => { try { return await API.get('/zones/danger') } catch { return fallback([]) } },
  getAlerts: async () => { try { return await API.get('/zones/alerts') } catch { return fallback([]) } },
  blockRoute: async (id) => { try { return await API.put(`/routes/${id}/block`) } catch { return fallback({ message: `Route ${id} bloquée` }) } }
}

// NOUVELLES ROUTES API
export const communiqueService = {
  getAll: async () => { try { return await API.get('/communiques') } catch { return fallback([]) } },
  create: async (data) => { try { return await API.post('/communiques', data) } catch { return fallback({ id: Date.now(), ...data }) } },
  delete: async (id) => { try { return await API.delete(`/communiques/${id}`) } catch { return fallback({ success: true }) } },
  broadcast: async (id) => { try { return await API.post(`/communiques/${id}/broadcast`) } catch { console.log(`📢 Broadcast communiqué ${id}`); return fallback({ success: true }) } }
}

export const meteoService = {
  getAll: async () => { try { return await API.get('/meteo') } catch { return fallback(METEO_DATA) } }
}

export const userService = {
  getAll: async () => { try { return await API.get('/users') } catch { return fallback([]) } },
  alertUser: async (userId, message) => { try { return await API.post(`/users/${userId}/alert`, { message }) } catch { console.log(`📱 Alerte utilisateur ${userId}: ${message}`); return fallback({ success: true }) } }
}

// ============================================================
// UTILITAIRES
// ============================================================
export function haversine(la1, lo1, la2, lo2) {
  const R = 6371
  const dL = ((la2 - la1) * Math.PI) / 180
  const dO = ((lo2 - lo1) * Math.PI) / 180
  const a = Math.sin(dL / 2) ** 2 + Math.cos(la1 * Math.PI / 180) * Math.cos(la2 * Math.PI / 180) * Math.sin(dO / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function addDistances(refuges, lat, lon) {
  return refuges.map(r => {
    const d = haversine(lat, lon, r.lat, r.lng)
    return { ...r, distance_km: Math.round(d * 100) / 100, time_min: Math.round((d / 4.5) * 60 * 10) / 10, available_spots: r.capacity - r.occupancy, is_full: r.occupancy >= r.capacity }
  }).sort((a, b) => a.distance_km - b.distance_km)
}

function buildPath(la1, lo1, la2, lo2) {
  return Array.from({ length: 7 }, (_, i) => {
    const t = i / 6, j = i > 0 && i < 6 ? (Math.random() - 0.5) * 0.003 : 0
    return { latitude: la1 + (la2 - la1) * t + j, longitude: lo1 + (lo2 - lo1) * t + j }
  })
}

export default API