import { storage } from '../utils/helpers'

// Vérifier si les notifications sont supportées
export const areNotificationsSupported = () => {
  return 'Notification' in window
}

// Demander la permission
export const requestNotificationPermission = async () => {
  if (!areNotificationsSupported()) {
    console.warn('Notifications non supportées')
    return false
  }

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// Envoyer une notification
export const sendNotification = (title, options = {}) => {
  if (!areNotificationsSupported() || Notification.permission !== 'granted') {
    return
  }

  const defaultOptions = {
    icon: '/logo.png',
    badge: '/logo.png',
    silent: false,
    vibrate: [200, 100, 200]
  }

  new Notification(title, { ...defaultOptions, ...options })
}

// Stocker les alertes non lues
let unreadAlerts = storage.get('unreadAlerts') || []

export const getUnreadAlerts = () => unreadAlerts

export const addUnreadAlert = (alert) => {
  // Éviter les doublons
  if (unreadAlerts.some(a => a.id === alert.id)) {
    return
  }
  unreadAlerts = [alert, ...unreadAlerts].slice(0, 50)
  storage.set('unreadAlerts', unreadAlerts)

  // Envoyer une notification push
  sendNotification(alert.title, { body: alert.message, tag: `alert-${alert.id}` })
}

export const markAlertAsRead = (alertId) => {
  unreadAlerts = unreadAlerts.filter(a => a.id !== alertId)
  storage.set('unreadAlerts', unreadAlerts)
}

export const markAllAlertsAsRead = () => {
  unreadAlerts = []
  storage.set('unreadAlerts', unreadAlerts)
}