import axios from 'axios'
import { API_URL } from '../utils/constants'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Intercepteur requête
api.interceptors.request.use((config) => {
  // Routes publiques (ne nécessitent pas de token)
  const isPublicRoute =
    config.url.includes('/auth/login') ||
    config.url.includes('/auth/register') ||
    config.url.includes('/health') ||
    config.url.includes('/districts') ||      // ← AJOUTE CE CI
    config.url.includes('/shelters') ||       // ← AJOUTE CE CI
    config.url.includes('/alerts/active')     // ← AJOUTE CE CI

  if (!isPublicRoute) {
    let token = localStorage.getItem('token')
    if (token && token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1)
    }
    if (token && token.startsWith('eyJ')) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Intercepteur réponse
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.detail || error.message || 'Une erreur est survenue'
    console.error('[API Error]', {
      status: error.response?.status,
      data: error.response?.data,
      message: errorMessage
    })

    if (error.response?.status === 401) {
      // Ne redirige pas pour les routes publiques
      const isPublicErrorRoute =
        error.config?.url?.includes('/districts') ||
        error.config?.url?.includes('/shelters') ||
        error.config?.url?.includes('/alerts/active')

      if (!isPublicErrorRoute) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    if (error.response?.status === 500) {
      console.error('[SERVER ERROR]', error.response?.data)
    }

    return Promise.reject(new Error(errorMessage))
  }
)

export default api