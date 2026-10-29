import api from './api'

export const routeService = {
  findBestShelter: (lat, lon, mode = 'normal') =>
    api.get('/itineraire/best-shelter', {
      params: { user_lat: lat, user_lon: lon, mode }
    }),

  pathToShelter: (lat, lon, shelterId, mode = 'normal') =>
    api.get(`/itineraire/to-shelter/${shelterId}`, {
      params: { user_lat: lat, user_lon: lon, mode }
    }),

  compareRoutes: (lat, lon, shelterId) =>
    api.get(`/itineraire/compare/${shelterId}`, {
      params: { user_lat: lat, user_lon: lon }
    })
}