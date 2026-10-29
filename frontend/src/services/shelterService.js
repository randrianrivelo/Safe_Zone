import api from './api'

// Conversion des données PostgreSQL vers le format frontend
const convertShelter = (dbShelter) => {
    return {
        id: dbShelter.id,
        name: dbShelter.name?.replace(/├ë/g, 'É').replace(/├┤/g, 'Ô').replace(/├®/g, 'é'),
        latitude: parseFloat(dbShelter.latitude),
        longitude: parseFloat(dbShelter.longitude),
        shelter_type: dbShelter.shelter_type,
        status: dbShelter.status,
        capacity_total: dbShelter.capacity_total || 0,
        current_occupancy: dbShelter.current_occupancy || 0,
        district_id: dbShelter.district_id,
        address: dbShelter.address?.replace(/├ë/g, 'É').replace(/├┤/g, 'Ô').replace(/├®/g, 'é'),
        has_water: dbShelter.has_water || false,
        has_electricity: dbShelter.has_electricity || false,
        has_medical: dbShelter.has_medical || false,
        has_food: dbShelter.has_food || false,
        contact_phone: dbShelter.contact_phone,
        is_active: dbShelter.is_active
    }
}

export const shelterService = {
    getAll: async (params = {}) => {
        try {
            const response = await api.get('/shelters/', { params })
            if (response && Array.isArray(response)) {
                return response.map(convertShelter)
            }
            return []
        } catch (error) {
            console.warn('ShelterService: API failed, using fallback', error)
            return []
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/shelters/${id}`)
            return convertShelter(response)
        } catch (error) {
            console.error(`ShelterService: getById ${id} failed`, error)
            return null
        }
    },

    getByDistrict: async (districtId) => {
        const all = await shelterService.getAll()
        return all.filter(s => s.district_id === districtId)
    },

    getAvailable: async () => {
        const all = await shelterService.getAll()
        return all.filter(s => s.status === 'ouvert' && s.current_occupancy < s.capacity_total)
    },

    getStats: async () => {
        const all = await shelterService.getAll()
        const totalCapacity = all.reduce((sum, s) => sum + (s.capacity_total || 0), 0)
        const totalOccupancy = all.reduce((sum, s) => sum + (s.current_occupancy || 0), 0)

        return {
            total_shelters: all.length,
            total_capacity: totalCapacity,
            total_occupancy: totalOccupancy,
            available_spots: totalCapacity - totalOccupancy,
            open_shelters: all.filter(s => s.status === 'ouvert').length,
            saturated_shelters: all.filter(s => s.status === 'sature').length
        }
    },

    update: async (id, data) => {
        return api.patch(`/shelters/${id}`, data)
    }
}