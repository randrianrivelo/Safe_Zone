class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.isConnecting = false
    this.enabled = true
    this.userId = null
  }

  connect(userId) {
    if (!this.enabled) {
      console.log('WebSocket désactivé')
      return
    }

    if (!userId) {
      console.warn('WebSocket: Pas d\'ID utilisateur')
      return
    }

    this.userId = userId

    if (this.isConnecting) return
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket déjà connecté')
      return
    }

    this.isConnecting = true
    const wsUrl = `ws://localhost:8000/api/ws/${userId}`

    try {
      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        console.log('✅ WebSocket connecté')
        this.isConnecting = false
        this.reconnectAttempts = 0
        this.notifyListeners({
          type: 'connection',
          status: 'connected',
          message: 'Connecté au serveur de notifications'
        })
      }

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.notifyListeners(data)

          // Notification système pour les alertes
          if (data.type === 'alert' && Notification.permission === 'granted') {
            new Notification(data.title, {
              body: data.message,
              icon: '/logo.png',
              tag: `alert-${Date.now()}`,
              requireInteraction: data.severity === 'critique'
            })
          }
        } catch (e) {
          console.error('Erreur parsing message:', e)
        }
      }

      this.socket.onclose = (event) => {
        console.log('WebSocket déconnecté')
        this.isConnecting = false
        this.notifyListeners({
          type: 'connection',
          status: 'disconnected',
          message: 'Déconnecté du serveur'
        })

        if (this.enabled && event.code !== 1000) {
          this.reconnect()
        }
      }

      this.socket.onerror = (error) => {
        console.error('Erreur WebSocket:', error)
        this.isConnecting = false
      }

    } catch (err) {
      console.error('Erreur connexion WebSocket:', err)
      this.isConnecting = false
    }
  }

  reconnect() {
    if (!this.enabled) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('WebSocket: Max reconnexions atteint')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts
    console.log(`WebSocket: Reconnexion dans ${delay}ms (tentative ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    setTimeout(() => {
      if (this.userId) {
        this.connect(this.userId)
      }
    }, delay)
  }

  disconnect() {
    this.enabled = false
    if (this.socket) {
      this.socket.close(1000, 'Déconnexion volontaire')
      this.socket = null
    }
    this.isConnecting = false
    this.reconnectAttempts = 0
  }

  reconnectManually() {
    this.enabled = true
    this.reconnectAttempts = 0
    if (this.userId) {
      this.connect(this.userId)
    }
  }

  send(message) {
    if (!this.enabled) return false
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
      return true
    }
    console.warn('WebSocket: Non connecté, message non envoyé')
    return false
  }

  addListener(callback) {
    this.listeners.push(callback)
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback)
  }

  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data)
      } catch (e) {
        console.error('Erreur listener:', e)
      }
    })
  }

  ping() {
    return this.send({ type: 'ping' })
  }

  sendAlert(title, message, severity = 'info') {
    return this.send({
      type: 'alert',
      title: title,
      message: message,
      severity: severity
    })
  }

  sendTest() {
    return this.send({ type: 'test' })
  }

  isConnected() {
    return this.socket && this.socket.readyState === WebSocket.OPEN
  }

  getStatus() {
    if (!this.socket) return 'disconnected'
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }
}

export const wsService = new WebSocketService()

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('Notifications non supportées')
    return false
  }

  if (Notification.permission === 'granted') {
    console.log('Notifications déjà autorisées')
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}