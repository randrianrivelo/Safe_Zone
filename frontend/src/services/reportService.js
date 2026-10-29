import api from './api'

export const reportService = {
  create: async (data) => {
    return api.post('/reports/', data)
  },

  getAll: async () => {
    try {
      return await api.get('/reports/')
    } catch (error) {
      console.warn('ReportService: getAll failed', error)
      return []
    }
  },

  getById: async (id) => {
    return api.get(`/reports/${id}`)
  },

  getPending: async () => {
    try {
      return await api.get('/reports/pending')
    } catch (error) {
      console.warn('ReportService: getPending failed', error)
      return []
    }
  },

  update: async (id, data) => {
    return api.patch(`/reports/${id}`, data)
  },

  delete: async (id) => {
    return api.delete(`/reports/${id}`)
  }
}
