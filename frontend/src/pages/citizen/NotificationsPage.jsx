import { useEffect } from 'react'
import { useAlertStore } from '../../stores/alertStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './NotificationsPage.css'

export default function NotificationsPage() {
  const { theme } = useThemeStore()
  const { alerts, fetchAlerts, markAsRead, markAllAsRead } = useAlertStore()
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  useEffect(() => {
    fetchAlerts()
  }, [])

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  const getSeverityLabel = (severity) => {
    const labels = {
      critique: fr ? 'Critique' : 'Goavana',
      eleve: fr ? 'Élevé' : 'Avo',
      moyen: fr ? 'Moyen' : 'Antonony',
      faible: fr ? 'Faible' : 'Kely'
    }
    return labels[severity] || severity
  }

  const handleNotificationClick = (alertId) => {
    markAsRead(alertId)
  }

  return (
    <div className="notifications-page">
      <Navbar />
      <main className="notifications-page__main">
        <div className="notifications-page__header">
          <h1><i className="bi bi-bell" /> {fr ? 'Notifications' : 'Fampandrenesana'}</h1>
          {alerts.length > 0 && (
            <button className="notifications-page__mark-read" onClick={markAllAsRead}>
              <i className="bi bi-check2-all" /> {fr ? 'Tout marquer comme lu' : 'Mamarika rehetra'}
            </button>
          )}
        </div>

        {alerts.length === 0 ? (
          <div className="notifications-page__empty">
            <i className="bi bi-bell-slash" />
            <p>{fr ? 'Aucune notification' : 'Tsy misy fampandrenesana'}</p>
          </div>
        ) : (
          <div className="notifications-page__list">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className="notifications-page__item"
                onClick={() => handleNotificationClick(alert.id)}
              >
                <div className="notifications-page__item-icon" style={{ background: `${getSeverityColor(alert.severity)}15` }}>
                  <i className="bi bi-exclamation-triangle-fill" style={{ color: getSeverityColor(alert.severity) }} />
                </div>
                <div className="notifications-page__item-content">
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                  <span className="notifications-page__item-date">
                    {new Date(alert.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <span className="notifications-page__item-badge" style={{
                  background: `${getSeverityColor(alert.severity)}15`,
                  color: getSeverityColor(alert.severity)
                }}>
                  {getSeverityLabel(alert.severity)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}