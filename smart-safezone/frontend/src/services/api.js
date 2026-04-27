// src/services/api.js
import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
})

// ==================================================
// DONNÉES FICTIVES (utilisées si le backend est OFF)
// ==================================================

const MOCK_REFUGES = [
  {
    id: 1,
    name: "Lycée JJ Rabearivelo",
    description: "Grand lycée avec cour spacieuse",
    latitude: -18.9137,
    longitude: 47.5261,
    capacity: 500,
    current_occupancy: 120,
    type: "ecole",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: false
  },
  {
    id: 2,
    name: "Stade Alarobia",
    description: "Stade couvert très spacieux",
    latitude: -18.8987,
    longitude: 47.5198,
    capacity: 2000,
    current_occupancy: 450,
    type: "stade",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: true
  },
  {
    id: 3,
    name: "Église Analakely",
    description: "Grande église au centre-ville",
    latitude: -18.9108,
    longitude: 47.5245,
    capacity: 300,
    current_occupancy: 280,
    type: "eglise",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: false
  },
  {
    id: 4,
    name: "Gymnase Ankorondrano",
    description: "Gymnase municipal couvert",
    latitude: -18.8912,
    longitude: 47.5165,
    capacity: 800,
    current_occupancy: 200,
    type: "gymnase",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: true
  },
  {
    id: 5,
    name: "Hôpital HJRA",
    description: "Hôpital avec zone d'accueil d'urgence",
    latitude: -18.9180,
    longitude: 47.5235,
    capacity: 400,
    current_occupancy: 400,
    type: "hopital",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: true
  },
  {
    id: 6,
    name: "Palais des Sports Mahamasina",
    description: "Grand complexe sportif national",
    latitude: -18.9220,
    longitude: 47.5190,
    capacity: 3000,
    current_occupancy: 800,
    type: "stade",
    is_active: true,
    has_water: true,
    has_electricity: true,
    has_medical: true
  },
  {
    id: 7,
    name: "Centre FJKM Ambatonakanga",
    description: "Centre communautaire",
    latitude: -18.9060,
    longitude: 47.5280,
    capacity: 200,
    current_occupancy: 50,
    type: "centre",
    is_active: true,
    has_water: true,
    has_electricity: false,
    has_medical: false
  },
  {
    id: 8,
    name: "École Primaire Ambohijatovo",
    description: "École avec abri temporaire",
    latitude: -18.9145,
    longitude: 47.5300,
    capacity: 150,
    current_occupancy: 30,
    type: "ecole",
    is_active: true,
    has_water: true,
    has_electricity: false,
    has_medical: false
  }
]

const MOCK_DANGER_ZONES = [
  {
    id: 1,
    name: "Inondation Analakely",
    description: "Zone basse régulièrement inondée lors des fortes pluies",
    latitude: -18.9115,
    longitude: 47.5245,
    radius: 300,
    danger_type: "flood",
    severity: 4,
    is_active: true
  },
  {
    id: 2,
    name: "Glissement Ambohijatovo",
    description: "Risque de glissement de terrain sur la colline",
    latitude: -18.9160,
    longitude: 47.5310,
    radius: 200,
    danger_type: "landslide",
    severity: 3,
    is_active: true
  },
  {
    id: 3,
    name: "Vent fort Mahamasina",
    description: "Zone exposée aux vents violents",
    latitude: -18.9230,
    longitude: 47.5180,
    radius: 250,
    danger_type: "wind",
    severity: 2,
    is_active: true
  }
]

const MOCK_ALERTS = [
  {
    id: 1,
    title: "Cyclone GAMANE approche",
    message: "Un cyclone de catégorie 3 approche la région Analamanga. Rejoignez les refuges immédiatement.",
    alert_type: "cyclone",
    severity: "critical",
    is_active: true
  },
  {
    id: 2,
    title: "Fortes pluies prévues",
    message: "Des pluies torrentielles sont attendues dans les prochaines 24 heures.",
    alert_type: "flood",
    severity: "warning",
    is_active: true
  }
]

// ==================================================
// FONCTIONS UTILITAIRES
// ==================================================

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function addDistanceToRefuges(refuges, userLat, userLon) {
  return refuges
    .map((r) => {
      const dist = calculateDistance(userLat, userLon, r.latitude, r.longitude)
      return {
        ...r,
        distance_km: Math.round(dist * 100) / 100,
        estimated_time_minutes: Math.round((dist / 4.5) * 60 * 10) / 10
      }
    })
    .sort((a, b) => a.distance_km - b.distance_km)
}

// ==================================================
// SERVICES API (avec fallback sur données fictives)
// ==================================================

export const refugeService = {
  getAll: async () => {
    try {
      const res = await api.get('/refuges/')
      return res
    } catch {
      return { data: MOCK_REFUGES }
    }
  },

  getById: async (id) => {
    try {
      const res = await api.get(`/refuges/${id}`)
      return res
    } catch {
      return { data: MOCK_REFUGES.find((r) => r.id === id) }
    }
  },

  getNearest: async (lat, lon, limit = 10) => {
    try {
      const res = await api.get(`/refuges/nearest/?lat=${lat}&lon=${lon}&limit=${limit}`)
      return res
    } catch {
      const sorted = addDistanceToRefuges(MOCK_REFUGES, lat, lon)
      return { data: sorted.slice(0, limit) }
    }
  },

  create: async (data) => {
    try {
      const res = await api.post('/refuges/', data)
      return res
    } catch {
      const newRefuge = { ...data, id: MOCK_REFUGES.length + 1, current_occupancy: 0, is_active: true }
      MOCK_REFUGES.push(newRefuge)
      return { data: newRefuge }
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`/refuges/${id}`, data)
      return res
    } catch {
      return { data: { id, ...data } }
    }
  }
}

export const pathfindingService = {
  findSafestRoute: async (startLat, startLon, refugeId) => {
    try {
      const res = await api.post('/pathfinding/safest-route', {
        start_lat: startLat,
        start_lon: startLon,
        refuge_id: refugeId
      })
      return res
    } catch {
      // Simuler un itinéraire
      const refuge = MOCK_REFUGES.find((r) => r.id === refugeId)
      if (!refuge) return { data: { success: false } }

      const dist = calculateDistance(startLat, startLon, refuge.latitude, refuge.longitude)

      // Créer des points intermédiaires pour la ligne
      const steps = 5
      const path = []
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        path.push({
          latitude: startLat + (refuge.latitude - startLat) * t + (Math.random() - 0.5) * 0.002,
          longitude: startLon + (refuge.longitude - startLon) * t + (Math.random() - 0.5) * 0.002,
          name: i === 0 ? 'Départ' : i === steps ? refuge.name : `Point ${i}`
        })
      }
      // S'assurer que le dernier point est bien le refuge
      path[steps] = {
        latitude: refuge.latitude,
        longitude: refuge.longitude,
        name: refuge.name
      }

      return {
        data: {
          success: true,
          data: {
            path: path,
            total_distance_km: Math.round(dist * 100) / 100,
            estimated_time_minutes: Math.round((dist / 4.5) * 60 * 10) / 10,
            refuge_name: refuge.name,
            refuge_id: refuge.id
          }
        }
      }
    }
  },

  findBestRefuges: async (lat, lon) => {
    try {
      const res = await api.get(`/pathfinding/best-refuges?lat=${lat}&lon=${lon}`)
      return res
    } catch {
      const sorted = addDistanceToRefuges(
        MOCK_REFUGES.filter((r) => r.current_occupancy < r.capacity),
        lat,
        lon
      )
      const best = sorted[0]
      if (!best) return { data: { success: false, data: [] } }

      const steps = 5
      const path = []
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        path.push({
          latitude: lat + (best.latitude - lat) * t + (Math.random() - 0.5) * 0.002,
          longitude: lon + (best.longitude - lon) * t + (Math.random() - 0.5) * 0.002,
          name: i === 0 ? 'Départ' : i === steps ? best.name : `Point ${i}`
        })
      }
      path[steps] = {
        latitude: best.latitude,
        longitude: best.longitude,
        name: best.name
      }

      return {
        data: {
          success: true,
          data: [
            {
              refuge_id: best.id,
              refuge_name: best.name,
              path: path,
              total_distance_km: best.distance_km,
              distance_km: best.distance_km,
              estimated_time_minutes: best.estimated_time_minutes
            }
          ]
        }
      }
    }
  }
}

export const zoneService = {
  getDangerZones: async () => {
    try {
      const res = await api.get('/danger-zones')
      return res
    } catch {
      return { data: MOCK_DANGER_ZONES }
    }
  },

  getAlerts: async () => {
    try {
      const res = await api.get('/alerts')
      return res
    } catch {
      return { data: MOCK_ALERTS }
    }
  },

  blockRoute: async (edgeId) => {
    try {
      const res = await api.put(`/routes/${edgeId}/block`)
      return res
    } catch {
      return { data: { message: `Route ${edgeId} bloquée (mode local)` } }
    }
  }
}

export default api