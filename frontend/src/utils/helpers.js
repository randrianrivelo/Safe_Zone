// Formate la distance
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

// Formate le temps
export const formatTime = (minutes) => {
  if (minutes < 60) return `${Math.round(minutes)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}h${m.toString().padStart(2, '0')}`
}

// Formate la date
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calcule le pourcentage d'occupation
export const getOccupancyPercent = (current, total) => {
  if (!total) return 0
  return Math.round((current / total) * 100)
}

// Couleur selon occupation
export const getOccupancyColor = (percent) => {
  if (percent >= 90) return '#ff3b30'
  if (percent >= 70) return '#ff9500'
  if (percent >= 50) return '#ffd60a'
  return '#39ff88'
}

// Couleur selon statut refuge
export const getStatusColor = (status) => {
  const colors = {
    ouvert: '#39ff88',
    sature: '#ff9500',
    ferme: '#ff3b30',
    en_preparation: '#38bdf8'
  }
  return colors[status] || '#94a3b8'
}

// Couleur selon sévérité
export const getSeverityColor = (severity) => {
  const colors = {
    faible: '#34c759',
    moyen: '#ffd60a',
    eleve: '#ff9500',
    critique: '#ff3b30'
  }
  return colors[severity] || '#94a3b8'
}

// Nettoyer les chaînes avec des caractères mal encodés
export const cleanString = (str) => {
  if (!str) return ''
  let cleaned = str
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã®/g, 'î')
    .replace(/Ã´/g, 'ô')
    .replace(/Ã»/g, 'û')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã€/g, 'À')
    .replace(/Ã‰/g, 'É')
    .replace(/Ãˆ/g, 'È')
    .replace(/Ã”/g, 'Ô')
    .replace(/Ã›/g, 'Û')
    .replace(/ÃŽ/g, 'Î')
    .replace(/Â/g, '')
    .replace(/â€/g, '')
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€”/g, '-')
    .replace(/â€¢/g, '-')
    .replace(/Ã‚/g, 'Â')
    .replace(/Ã„/g, 'Ä')
    .replace(/Ã†/g, 'Æ')
    .replace(/Ã‡/g, 'Ç')
    .replace(/ÃŠ/g, 'Ê')
    .replace(/Ã‹/g, 'Ë')
    .replace(/ÃŒ/g, 'Ì')
    .replace(/Ã/g, '')
    .trim()

  // Corriger les cas spécifiques
  cleaned = cleaned.replace(/UniversitÃ©/g, 'Université')
  cleaned = cleaned.replace(/AÃ©roport/g, 'Aéroport')
  cleaned = cleaned.replace(/Ã‰glise/g, 'Église')

  return cleaned
}

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key)
      if (!item || item === 'null' || item === 'undefined') return null
      return JSON.parse(item)
    } catch {
      return localStorage.getItem(key)
    }
  },
  set: (key, value) => {
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
    } else {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
  remove: (key) => localStorage.removeItem(key),
  clear: () => localStorage.clear()
}
// Récupérer le token proprement (FIX BUG TOKEN)
export const getAuthToken = () => {
  const token = storage.get('token')
  if (!token) return null
  // Si le token est un objet avec access_token, extraire
  if (typeof token === 'object' && token.access_token) {
    return token.access_token
  }
  // Si c'est une string, la retourner directement
  if (typeof token === 'string') {
    return token
  }
  return null
}

// Récupérer les headers d'authentification
export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}