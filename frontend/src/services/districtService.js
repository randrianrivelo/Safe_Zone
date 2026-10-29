// src/services/districtService.js
import api from './api'

// Données mockées des districts d'Analamanga
const MOCK_DISTRICTS = [
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

export const districtService = {
  /**
   * Récupérer tous les districts
   * @returns {Promise<Array>} Liste des districts
   */
  getAll: async () => {
    try {
      const response = await api.get('/districts/')
      if (response && Array.isArray(response) && response.length > 0) {
        return response
      }
      return MOCK_DISTRICTS
    } catch (error) {
      console.warn('Erreur chargement districts depuis API, utilisation des données mockées:', error)
      return MOCK_DISTRICTS
    }
  },

  /**
   * Récupérer un district par son ID
   * @param {number} id - ID du district
   * @returns {Promise<Object>} District
   */
  getById: async (id) => {
    try {
      return await api.get(`/districts/${id}`)
    } catch (error) {
      return MOCK_DISTRICTS.find(d => d.id === id) || null
    }
  },

  /**
   * Récupérer les refuges d'un district
   * @param {number} id - ID du district
   * @returns {Promise<Array>} Liste des refuges du district
   */
  getShelters: (id) => api.get(`/districts/${id}/shelters`),

  /**
   * Récupérer les statistiques d'un district
   * @param {number} id - ID du district
   * @returns {Promise<Object>} Statistiques
   */
  getStats: (id) => api.get(`/districts/${id}/stats`)
}