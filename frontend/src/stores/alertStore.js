import { create } from 'zustand'
import { storage } from '../utils/helpers'

// Clé pour stocker les alertes lues
const READ_ALERTS_KEY = 'sz_read_alerts'

export const useAlertStore = create((set, get) => ({
  alerts: [],
  unreadCount: 0,
  loading: false,
  pollingInterval: null,

  // Récupérer les alertes depuis l'API
  fetchAlerts: async (force = false) => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token')
    if (!token) {
      set({ alerts: [], unreadCount: 0, loading: false })
      return
    }

    set({ loading: true })
    try {
      let cleanToken = token
      if (cleanToken && cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1)
      }

      const res = await fetch('http://localhost:8000/api/alerts/active', {
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      })

      if (res.ok) {
        const data = await res.json()
        const alertsArray = Array.isArray(data) ? data : []

        // Récupérer les IDs des alertes déjà lues
        const readAlerts = storage.get(READ_ALERTS_KEY) || []
        const unreadCount = alertsArray.filter(a => !readAlerts.includes(a.id)).length

        set({ alerts: alertsArray, unreadCount, loading: false })
      } else if (res.status === 401) {
        set({ alerts: [], unreadCount: 0, loading: false })
      } else {
        set({ alerts: [], unreadCount: 0, loading: false })
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error)
      set({ alerts: [], unreadCount: 0, loading: false })
    }
  },

  // Marquer une alerte comme lue
  markAsRead: (alertId) => {
    const readAlerts = storage.get(READ_ALERTS_KEY) || []
    if (!readAlerts.includes(alertId)) {
      readAlerts.push(alertId)
      storage.set(READ_ALERTS_KEY, readAlerts)
      const { alerts } = get()
      const unreadCount = alerts.filter(a => !readAlerts.includes(a.id)).length
      set({ unreadCount })
    }
  },

  // Marquer toutes les alertes comme lues
  markAllAsRead: () => {
    const { alerts } = get()
    const readAlerts = alerts.map(a => a.id)
    storage.set(READ_ALERTS_KEY, readAlerts)
    set({ unreadCount: 0 })
  },

  // Ajouter une alerte (depuis l'admin)
  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      unreadCount: state.unreadCount + 1
    }))
  },

  // Supprimer une alerte
  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id)
    }))
    const readAlerts = storage.get(READ_ALERTS_KEY) || []
    if (!readAlerts.includes(id)) {
      readAlerts.push(id)
      storage.set(READ_ALERTS_KEY, readAlerts)
      set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }))
    }
  },

  // Démarrer le polling (requêtes périodiques) - UNIQUEMENT si admin
  startPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) clearInterval(pollingInterval)

    // Vérifier si l'utilisateur est admin
    const user = storage.get('user')
    const isAdmin = user?.role === 'admin'

    // Seulement les admins ont besoin de polling pour les alertes
    if (!isAdmin) return () => {}

    const interval = setInterval(() => {
      const token = localStorage.getItem('token')
      if (token) get().fetchAlerts()
    }, 60000)

    set({ pollingInterval: interval })
    return () => clearInterval(interval)
  },


  // Arrêter le polling
  stopPolling: () => {
    const { pollingInterval } = get()
    if (pollingInterval) {
      clearInterval(pollingInterval)
      set({ pollingInterval: null })
    }
  }
}))