import { useEffect, useState, useCallback } from 'react'
import { wsService, requestNotificationPermission } from '../services/websocketService'

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Demander la permission pour les notifications
    requestNotificationPermission()

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user?.id

    if (userId) {
      wsService.connect(userId)
    }

    const handleMessage = (data) => {
      setLastMessage(data)

      if (data.type === 'connection') {
        setIsConnected(data.status === 'connected')
      }

      if (data.type === 'alert') {
        const newAlert = {
          id: Date.now(),
          ...data,
          read: false,
          createdAt: new Date().toISOString()
        }
        setAlerts(prev => [newAlert, ...prev].slice(0, 50))
        setNotifications(prev => [newAlert, ...prev].slice(0, 20))
        setUnreadCount(prev => prev + 1)
      }
    }

    wsService.addListener(handleMessage)

    // Ping régulier pour garder la connexion active
    const pingInterval = setInterval(() => {
      if (wsService.isConnected()) {
        wsService.ping()
      }
    }, 30000)

    return () => {
      wsService.removeListener(handleMessage)
      clearInterval(pingInterval)
      wsService.disconnect()
    }
  }, [])

  const sendMessage = useCallback((message) => {
    return wsService.send(message)
  }, [])

  const sendAlert = useCallback((title, message, severity = 'info') => {
    return wsService.sendAlert(title, message, severity)
  }, [])

  const markAsRead = useCallback((alertId) => {
    setAlerts(prev => prev.map(a =>
      a.id === alertId ? { ...a, read: true } : a
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
    setUnreadCount(0)
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const clearAlerts = useCallback(() => {
    setAlerts([])
    setUnreadCount(0)
  }, [])

  return {
    isConnected,
    lastMessage,
    notifications,
    alerts,
    unreadCount,
    sendMessage,
    sendAlert,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearAlerts
  }
}