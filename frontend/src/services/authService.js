import api from './api'
import { storage } from '../utils/helpers'

export const authService = {
  register: async (data) => {
    const res = await api.post('/auth/register', data)
    storage.set('token', res.access_token)
    storage.set('user', {
      id: res.user_id,
      name: res.user_name,
      role: res.role,
      email: data.email
    })
    return res
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    storage.set('token', res.access_token)
    storage.set('user', {
      id: res.user_id,
      name: res.user_name,
      role: res.role,
      email: email
    })
    return res
  },

  emergencyLogin: async (email, emergency_code) => {
    const res = await api.post('/auth/emergency-login', { email, emergency_code })
    storage.set('token', res.access_token)
    storage.set('user', {
      id: res.user_id,
      name: res.user_name,
      role: res.role,
      email: email,
      urgence: true
    })
    return res
  },

  logout: () => {
    storage.remove('token')
    storage.remove('user')
    window.location.href = '/login'
  },

  getMe: () => api.get('/auth/me'),

  isAuthenticated: () => !!storage.get('token'),

  getUser: () => storage.get('user'),

  getRole: () => storage.get('user')?.role || null
}