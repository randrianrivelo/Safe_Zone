import api from './api'

export const dangerService = {
  getActive: async () => {
    try {
      return await api.get('/dangers/active')
    } catch (error) {
      console.warn('DangerService: getActive failed', error)
      return []
    }
  },

  getAll: async () => {
    try {
      return await api.get('/dangers/')
    } catch (error) {
      console.warn('DangerService: getAll failed', error)
      return []
    }
  },

  create: async (data) => {
    return api.post('/dangers/', data)
  },

  toggle: async (id) => {
    return api.patch(`/dangers/${id}/toggle`)
  },

  delete: async (id) => {
    return api.delete(`/dangers/${id}`)
  }
}
