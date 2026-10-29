import api from './api'

export const weatherService = {
  getProvinces: async () => {
    try {
      return await api.get('/weather/provinces')
    } catch (err) {
      console.warn('WeatherService: provinces indisponible', err)
      return [
        { key: 'antananarivo', name: 'Antananarivo', name_mg: 'Antananarivo', region: 'Hauts Plateaux' },
        { key: 'toamasina', name: 'Toamasina', name_mg: 'Toamasina', region: 'Côte Est' },
        { key: 'mahajanga', name: 'Mahajanga', name_mg: 'Mahajanga', region: 'Nord-Ouest' },
        { key: 'fianarantsoa', name: 'Fianarantsoa', name_mg: 'Fianarantsoa', region: 'Hauts Plateaux Sud' },
        { key: 'toliara', name: 'Toliara', name_mg: 'Toliara', region: 'Sud' },
        { key: 'antsiranana', name: 'Antsiranana', name_mg: 'Antsiranana', region: 'Nord' }
      ]
    }
  },

  getCurrent: async (province) => {
    try {
      return await api.get(`/weather/current/${province}`)
    } catch (err) {
      console.warn(`WeatherService: current ${province} indisponible`, err)
      return null
    }
  },

  getForecast: async (province, days = 7) => {
    try {
      const d = Math.max(1, Math.min(days, 7))
      return await api.get(`/weather/forecast/${province}`, { params: { days: d } })
    } catch (err) {
      console.warn(`WeatherService: forecast ${province} indisponible`, err)
      return []
    }
  },

  getRiskLevels: () => ({
    faible: { label: 'Faible risque', color: '#39ff88', icon: 'bi-cloud-sun' },
    moyen: { label: 'Risque modéré', color: '#ffd60a', icon: 'bi-cloud' },
    eleve: { label: 'Risque élevé', color: '#ff9500', icon: 'bi-cloud-lightning' },
    critique: { label: 'Risque critique', color: '#ff3b30', icon: 'bi-cloud-lightning-rain-fill' }
  })
}