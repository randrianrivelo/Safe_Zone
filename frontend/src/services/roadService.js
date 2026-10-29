import api from './api'

export const roadService = {
  getAll: async () => {
    try {
      return await api.get('/roads/')
    } catch (err) {
      console.warn('roadService.getAll failed', err)
      return []
    }
  },

  getBlocked: async () => {
    try {
      return await api.get('/roads/blocked')
    } catch (err) {
      console.warn('roadService.getBlocked failed', err)
      return []
    }
  },

  updateStatus: async (id, data) => {
    return api.patch(`/roads/${id}/status`, data)
  }
}
