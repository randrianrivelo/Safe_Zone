import { create } from 'zustand'
import { storage } from '../utils/helpers'
import { authService } from '../services/authService'

export const useAuthStore = create((set, get) => ({
  user: storage.get('user'),
  token: storage.get('token'),
  isAuthenticated: !!storage.get('token'),
  isUrgence: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await authService.login(email, password)
      const userData = {
        id: res.user_id,
        name: res.user_name,
        role: res.role,
        email: email
      }
      storage.set('token', res.access_token)
      storage.set('user', userData)
      set({ user: userData, token: res.access_token, isAuthenticated: true, isLoading: false })

      const mod = await import('./themeStore')
      mod.useThemeStore.getState().loadUserTheme(res.user_id)

      return res
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  register: async (data) => {
    set({ isLoading: true })
    try {
      const res = await authService.register(data)
      const userData = {
        id: res.user_id,
        name: res.user_name,
        role: res.role,
        email: data.email
      }
      storage.set('token', res.access_token)
      storage.set('user', userData)
      set({ user: userData, token: res.access_token, isAuthenticated: true, isLoading: false })

      const mod = await import('./themeStore')
      mod.useThemeStore.getState().loadUserTheme(res.user_id)

      return res
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  emergencyLogin: async (email, code) => {
    set({ isLoading: true })
    try {
      const res = await authService.emergencyLogin(email, code)
      const userData = {
        id: res.user_id,
        name: res.user_name,
        role: res.role,
        email: email,
        isUrgence: true
      }
      set({ user: userData, token: res.access_token, isAuthenticated: true, isUrgence: true, isLoading: false })

      const mod = await import('./themeStore')
      mod.useThemeStore.getState().loadUserTheme(res.user_id)

      return res
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  logout: () => {
    storage.remove('token')
    storage.remove('user')
    set({ user: null, token: null, isAuthenticated: false, isUrgence: false, isLoading: false })
  }
}))