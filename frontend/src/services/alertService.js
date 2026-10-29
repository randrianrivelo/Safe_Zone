import api from './api'

export const alertService = {
  getActive: async () => {
    try {
      return await api.get('/alerts/active')
    } catch (error) {
      // Silencieux si non authentifié
      if (error?.response?.status === 401) {
        return []
      }
      throw error
    }
  },
  create: (data) => api.post('/alerts/', data),
  deactivate: (id) => api.delete(`/alerts/${id}`)
}