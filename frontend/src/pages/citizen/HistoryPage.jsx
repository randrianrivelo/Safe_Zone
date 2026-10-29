import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './HistoryPage.css'

export default function HistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadHistory()
  }, [theme])

  // Récupérer le token proprement
  const getToken = () => {
    let token = localStorage.getItem('token')
    if (!token) return null
    // Enlever les guillemets si présents
    if (token.startsWith('"') && token.endsWith('"')) {
      token = token.slice(1, -1)
    }
    return token
  }

  // Charger l'historique depuis l'API et localStorage
  const loadHistory = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        setHistory([])
        setLoading(false)
        return
      }

      // 1. Récupérer les signalements depuis l'API
      let reports = []
      try {
        const reportsRes = await fetch('http://localhost:8000/api/reports/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (reportsRes.ok) {
          reports = await reportsRes.json()
        }
      } catch (err) {
        console.error('Erreur chargement signalements:', err)
      }

      // 2. Récupérer l'historique des itinéraires (localStorage)
      const savedRoutes = localStorage.getItem('route_history')
      const routeHistory = savedRoutes ? JSON.parse(savedRoutes) : []

      // 3. Récupérer l'historique des actions (localStorage)
      const savedActions = localStorage.getItem('action_history')
      const actionHistory = savedActions ? JSON.parse(savedActions) : []

      // 4. Formater les signalements
      const formattedReports = reports.map(r => ({
        id: `report-${r.id}`,
        type: 'signalement',
        title: getReportTypeLabel(r.report_type, fr),
        description: r.description || '',
        date: new Date(r.created_at),
        icon: getReportTypeIcon(r.report_type),
        color: getReportTypeColor(r.report_type),
        status: r.status,
        details: {
          report_type: r.report_type,
          latitude: r.latitude,
          longitude: r.longitude,
          status: r.status
        }
      }))

      // 5. Formater les itinéraires
      const formattedRoutes = routeHistory.map((r, i) => ({
        id: `route-${r.timestamp}-${i}`,
        type: 'itineraire',
        title: fr ? `Itinéraire vers ${r.shelter_name}` : `Lalana mankany ${r.shelter_name}`,
        description: `${fr ? 'Distance' : 'Halavirana'}: ${r.distance_km} km • ${fr ? 'Durée' : 'Fotoana'}: ${r.duration_min} min`,
        date: new Date(r.timestamp),
        icon: 'bi-sign-turn-right',
        color: 'var(--accent)',
        details: {
          shelter_name: r.shelter_name,
          shelter_id: r.shelter_id,
          distance_km: r.distance_km,
          duration_min: r.duration_min
        }
      }))

      // 6. Formater les actions
      const formattedActions = actionHistory.map((a, i) => ({
        id: `action-${a.timestamp}-${i}`,
        type: a.type,
        title: getActionLabel(a.type, fr),
        description: a.description || '',
        date: new Date(a.timestamp),
        icon: getActionIcon(a.type),
        color: getActionColor(a.type),
        details: a.details || {}
      }))

      // 7. Combiner et trier par date (plus récent en premier)
      let allHistory = [...formattedReports, ...formattedRoutes, ...formattedActions]
      allHistory.sort((a, b) => b.date - a.date)

      setHistory(allHistory)
    } catch (err) {
      console.error('Erreur chargement historique:', err)
      setError(fr ? 'Erreur de chargement' : 'Olana tamin\'ny fampidirana')
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  // Labels des types de signalements
  const getReportTypeLabel = (type, fr) => {
    const labels = {
      route_endommagee: fr ? 'Route endommagée' : 'Lalana simba',
      zone_danger: fr ? 'Zone dangereuse' : 'Toerana mampidi-doza',
      refuge_plein: fr ? 'Refuge saturé' : 'Toerana feno',
      inondation: fr ? 'Inondation' : 'Tondra-drano',
      besoin_urgent: fr ? 'Besoin urgent' : 'Ilaina haingana',
      alerte_cyclone: fr ? 'Alerte cyclone' : 'Fampitandremana rivo-doza',
      autre: fr ? 'Autre' : 'Hafa'
    }
    return labels[type] || (fr ? 'Signalement' : 'Fampandrenesana')
  }

  const getReportTypeIcon = (type) => {
    const icons = {
      route_endommagee: 'bi-signpost-split',
      zone_danger: 'bi-radioactive',
      refuge_plein: 'bi-building-fill-x',
      inondation: 'bi-water',
      besoin_urgent: 'bi-heart-pulse-fill',
      alerte_cyclone: 'bi-cloud-lightning-rain-fill'
    }
    return icons[type] || 'bi-exclamation-diamond'
  }

  const getReportTypeColor = (type) => {
    const colors = {
      route_endommagee: '#ff9500',
      zone_danger: '#ff3b30',
      refuge_plein: '#ff9500',
      inondation: '#38bdf8',
      besoin_urgent: '#ff3b30',
      alerte_cyclone: '#a855f7'
    }
    return colors[type] || '#94a3b8'
  }

  // Labels des actions
  const getActionLabel = (type, fr) => {
    const labels = {
      login: fr ? 'Connexion' : 'Niditra',
      logout: fr ? 'Déconnexion' : 'Nivoaka',
      emergency: fr ? 'Mode urgence' : 'Fomba maika',
      report: fr ? 'Signalement' : 'Fampandrenesana',
      route: fr ? 'Recherche itinéraire' : 'Nitady lalana'
    }
    return labels[type] || type
  }

  const getActionIcon = (type) => {
    const icons = {
      login: 'bi-box-arrow-in-right',
      logout: 'bi-box-arrow-right',
      emergency: 'bi-lightning-charge-fill',
      report: 'bi-exclamation-diamond',
      route: 'bi-sign-turn-right'
    }
    return icons[type] || 'bi-clock-history'
  }

  const getActionColor = (type) => {
    const colors = {
      login: '#39ff88',
      logout: '#ff3b30',
      emergency: '#ff3b30',
      report: '#ff9500',
      route: 'var(--accent)'
    }
    return colors[type] || 'var(--text-muted)'
  }

  // Statut des signalements
  const getStatusLabel = (status, fr) => {
    const labels = {
      en_attente: fr ? 'En attente' : 'Miandry',
      verifie: fr ? 'Vérifié' : 'Voamarina',
      rejete: fr ? 'Rejeté' : 'Nolavina'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      en_attente: '#ffd60a',
      verifie: '#39ff88',
      rejete: '#ff3b30'
    }
    return colors[status] || '#94a3b8'
  }

  // Filtrer l'historique
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  // Supprimer tout l'historique
  const clearHistory = () => {
    if (window.confirm(fr ? 'Supprimer tout l\'historique ? Cette action est irréversible.' : 'Hamafa ny tantara rehetra ? Tsy azo averina izany.')) {
      localStorage.removeItem('route_history')
      localStorage.removeItem('action_history')
      setHistory(prev => prev.filter(item => item.type !== 'itineraire' && item.type !== 'action'))
      alert(fr ? 'Historique effacé' : 'Tantara voafafa')
    }
  }

  // Supprimer un élément spécifique
  const deleteHistoryItem = (id, type) => {
    if (type === 'itineraire') {
      const savedRoutes = localStorage.getItem('route_history')
      const routes = savedRoutes ? JSON.parse(savedRoutes) : []
      const newRoutes = routes.filter((_, i) => `route-${routes[i].timestamp}-${i}` !== id)
      localStorage.setItem('route_history', JSON.stringify(newRoutes))
    } else if (type === 'action') {
      const savedActions = localStorage.getItem('action_history')
      const actions = savedActions ? JSON.parse(savedActions) : []
      const newActions = actions.filter((_, i) => `action-${actions[i].timestamp}-${i}` !== id)
      localStorage.setItem('action_history', JSON.stringify(newActions))
    }
    // Recharger l'historique
    loadHistory()
  }

  // Refaire un itinéraire
  const repeatRoute = (shelterId) => {
    navigate(`/map?shelter=${shelterId}`)
  }

  return (
    <div className="history">
      <Navbar />
      <main className="history__main">
        <div className="history__header">
          <h1 className="history__title">
            <i className="bi bi-clock-history" />
            {fr ? 'Mon historique' : 'Ny tantarako'}
          </h1>
          {history.filter(h => h.type !== 'signalement').length > 0 && (
            <button className="history__clear-btn" onClick={clearHistory}>
              <i className="bi bi-trash" /> {fr ? 'Tout effacer' : 'Hamafa rehetra'}
            </button>
          )}
        </div>

        {/* Filtres */}
        <div className="history__filters">
          <button className={`history__filter ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            {fr ? 'Tous' : 'Rehetra'} ({history.length})
          </button>
          <button className={`history__filter ${filter === 'itineraire' ? 'active' : ''}`} onClick={() => setFilter('itineraire')}>
            <i className="bi bi-sign-turn-right" /> {fr ? 'Itinéraires' : 'Lalana'} ({history.filter(h => h.type === 'itineraire').length})
          </button>
          <button className={`history__filter ${filter === 'signalement' ? 'active' : ''}`} onClick={() => setFilter('signalement')}>
            <i className="bi bi-exclamation-diamond" /> {fr ? 'Signalements' : 'Fampandrenesana'} ({history.filter(h => h.type === 'signalement').length})
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="history__error">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{error}</span>
            <button onClick={loadHistory}>{fr ? 'Réessayer' : 'Andramo indray'}</button>
          </div>
        )}

        {/* Chargement */}
        {loading ? (
          <div className="history__loading"><div className="spinner-lg" /></div>
        ) : filteredHistory.length === 0 ? (
          <div className="history__empty">
            <i className="bi bi-clock-history" />
            <p>{fr ? 'Aucun historique' : 'Tsy misy tantara'}</p>
            <button className="history__empty-btn" onClick={() => navigate('/map')}>
              <i className="bi bi-map" /> {fr ? 'Trouver un refuge' : 'Mitady toerana'}
            </button>
          </div>
        ) : (
          <div className="history__list">
            {filteredHistory.map((item) => (
              <div key={item.id} className="history__item">
                <div className="history__icon" style={{ background: `${item.color}15`, borderColor: `${item.color}30` }}>
                  <i className={item.icon} style={{ color: item.color }} />
                </div>

                <div className="history__info">
                  <strong>{item.title}</strong>
                  {item.description && <span>{item.description}</span>}
                  <span className="history__date">
                    {item.date.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {item.status && (
                    <span className="history__status" style={{ color: getStatusColor(item.status) }}>
                      {getStatusLabel(item.status, fr)}
                    </span>
                  )}
                </div>

                <div className="history__actions">
                  {item.type === 'itineraire' && item.details?.shelter_id && (
                    <button
                      className="history__repeat-btn"
                      onClick={() => repeatRoute(item.details.shelter_id)}
                      title={fr ? 'Refaire l\'itinéraire' : 'Averina ny lalana'}
                    >
                      <i className="bi bi-arrow-repeat" />
                    </button>
                  )}
                  {item.type !== 'signalement' && (
                    <button
                      className="history__delete-btn"
                      onClick={() => deleteHistoryItem(item.id, item.type)}
                      title={fr ? 'Supprimer' : 'Hamafa'}
                    >
                      <i className="bi bi-trash" />
                    </button>
                  )}
                  {item.type === 'signalement' && item.status === 'en_attente' && (
                    <span className="history__pending-badge">
                      <i className="bi bi-hourglass-split" /> {fr ? 'En cours' : 'Mandeha'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="history__back" onClick={() => navigate('/dashboard')}>
          <i className="bi bi-arrow-left" /> {fr ? 'Retour' : 'Hiverina'}
        </button>
      </main>
    </div>
  )
}