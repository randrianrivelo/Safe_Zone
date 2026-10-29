import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useAlertStore } from '../../stores/alertStore'
import { wsService } from '../../services/websocketService'
import './Navbar.css'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const { alerts, unreadCount, fetchAlerts, markAsRead, markAllAsRead } = useAlertStore()
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr')
  const [wsConnected, setWsConnected] = useState(false)
  const fr = lang === 'fr'

  const menuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchAlerts()
      loadAvatar()
    }
  }, [])

  // Connexion WebSocket
  useEffect(() => {
    if (user?.id) {
      wsService.connect(user.id)

      const handleWsMessage = (data) => {
        if (data.type === 'connection') {
          setWsConnected(data.status === 'connected')
        }
        if (data.type === 'alert') {
          // Ajouter l'alerte aux notifications existantes
          markAllAsRead()
        }
      }

      wsService.addListener(handleWsMessage)
      return () => {
        wsService.removeListener(handleWsMessage)
        wsService.disconnect()
      }
    }
  }, [user?.id])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setShowMenu(false)
    setShowNotif(false)
  }, [location.pathname])

  const toggleLang = () => {
    const next = lang === 'fr' ? 'mg' : 'fr'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const handleLogout = () => {
    wsService.disconnect()
    logout()
    navigate('/login')
  }

  const goTo = (path) => {
    setShowMenu(false)
    setShowNotif(false)
    navigate(path)
  }

  const openNotifications = () => {
    setShowNotif(!showNotif)
    if (!showNotif) {
      markAllAsRead()
    }
  }

  const handleNotificationClick = (alertId) => {
    markAsRead(alertId)
    goTo('/notifications')
  }

  const loadAvatar = async () => {
    if (!user?.id) return
    try {
      let token = localStorage.getItem('token')
      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1)
      }
      if (token && typeof token === 'object' && token.access_token) {
        token = token.access_token
      }
      if (token && typeof token === 'string' && token.startsWith('eyJ')) {
        const res = await fetch(`http://localhost:8000/api/user/avatar/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          if (data.avatar_url) {
            setAvatarUrl(`http://localhost:8000${data.avatar_url}`)
          }
        }
      }
    } catch (err) {
      console.error('Erreur chargement avatar:', err)
    }
  }

  const recentAlerts = alerts.slice(0, 5)

  const navLinks = [
    { path: '/dashboard', icon: 'bi-grid', label: fr ? 'Dashboard' : 'Sehatra' },
    { path: '/map', icon: 'bi-map', label: fr ? 'Carte' : 'Sarintany' },
    { path: '/citizen/weather', icon: 'bi-cloud-lightning-rain', label: fr ? 'Météo' : 'Toetr\'andro' },
    { path: '/report', icon: 'bi-exclamation-diamond', label: fr ? 'Signaler' : 'Mampandre' }
  ]

  const adminLinks = [
    { path: '/admin', icon: 'bi-speedometer2', label: 'Admin' },
    { path: '/admin/map', icon: 'bi-map', label: fr ? 'Supervision' : 'Fanaraha-maso' },
    { path: '/admin/shelters', icon: 'bi-building', label: fr ? 'Refuges' : 'Toerana' },
    { path: '/admin/alerts', icon: 'bi-bell', label: fr ? 'Alertes' : 'Fampitandremana' },
    { path: '/admin/emergency', icon: 'bi-shield-lock', label: fr ? 'Code urgence' : 'Kaody maika' }
  ]

  const agentLinks = [
    { path: '/agent/dashboard', icon: 'bi-person-badge', label: 'Agent' }
  ]

  let links = navLinks
  if (user?.role === 'admin') links = [...navLinks, ...adminLinks]
  if (user?.role === 'agent') links = [...navLinks, ...agentLinks]

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__brand" onClick={() => goTo('/dashboard')}>
        <img src="/logo.png" alt="Smart SafeZone" className="navbar__logo" />
        <span className="navbar__name">
          <span className="accent">Smart</span> SafeZone
        </span>
      </div>

      {/* Navigation */}
      <div className="navbar__links">
        {links.map((link, index) => (
          <button
            key={index}
            className={`navbar__link ${location.pathname === link.path ? 'active' : ''}`}
            onClick={() => goTo(link.path)}
          >
            <i className={link.icon}></i>
            <span>{link.label}</span>
          </button>
        ))}
      </div>

      {/* Actions droite */}
      <div className="navbar__actions">

        {/* Indicateur WebSocket - MASQUÉ TEMPORAIREMENT */}
{/*
<div
  className={`navbar__ws-indicator ${wsConnected ? 'connected' : 'disconnected'}`}
  title={wsConnected ? 'Notifications en temps réel actives' : 'Mode hors-ligne'}
>
  <i className={`bi bi-${wsConnected ? 'wifi' : 'wifi-off'}`}></i>
</div>
*/}

        {/* NOTIFICATIONS */}
        <div className="navbar__notif-wrap" ref={notifRef}>
          <button className="navbar__icon-btn" onClick={openNotifications}>
            <i className="bi bi-bell"></i>
            {unreadCount > 0 && (
              <span className="navbar__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotif && (
            <div className="navbar__dropdown navbar__notif-dropdown">
              <div className="navbar__dropdown-header">
                <strong>{fr ? 'Notifications' : 'Fampandrenesana'}</strong>
                {alerts.length > 0 && (
                  <button
                    className="navbar__notif-mark-all"
                    onClick={() => markAllAsRead()}
                  >
                    {fr ? 'Tout marquer lu' : 'Mamarika rehetra'}
                  </button>
                )}
              </div>

              <div className="navbar__notif-list">
                {recentAlerts.length === 0 ? (
                  <div className="navbar__notif-empty">
                    <i className="bi bi-bell-slash"></i>
                    <span>{fr ? 'Aucune notification' : 'Tsy misy fampandrenesana'}</span>
                  </div>
                ) : (
                  recentAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="navbar__notif-item"
                      onClick={() => handleNotificationClick(alert.id)}
                    >
                      <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }}></i>
                      <div className="navbar__notif-info">
                        <strong>{alert.title}</strong>
                        <span>{alert.message?.substring(0, 50)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="navbar__dropdown-divider"></div>
              <button
                className="navbar__notif-view-all"
                onClick={() => goTo('/notifications')}
              >
                <i className="bi bi-arrow-right"></i>
                {fr ? 'Voir toutes les notifications' : 'Hijery ny fampandrenesana rehetra'}
              </button>
            </div>
          )}
        </div>

        {/* Toggle thème */}
        <button className="navbar__icon-btn" onClick={toggleTheme}>
          <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`}></i>
        </button>

        {/* Toggle langue */}
        <button className="navbar__icon-btn navbar__lang-btn" onClick={toggleLang}>
          {fr ? '🇲🇬' : '🇫🇷'}
        </button>

        {/* Profil */}
        <div className="navbar__profile-wrap" ref={menuRef}>
          <button
            className="navbar__profile-btn"
            onClick={() => setShowMenu(!showMenu)}
          >
            <div className="navbar__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="navbar__avatar-img" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <span className="navbar__username">{user?.name || 'Utilisateur'}</span>
            <i className="bi bi-chevron-down"></i>
          </button>

          {showMenu && (
            <div className="navbar__dropdown">
              <button onClick={() => goTo('/profile')}>
                <i className="bi bi-person"></i>
                {fr ? 'Mon profil' : 'Ny mombamomba ahy'}
              </button>
              <button onClick={() => goTo('/user/settings')}>
                <i className="bi bi-gear"></i>
                {fr ? 'Paramètres' : 'Fitamboatra'}
              </button>
              <button onClick={() => goTo('/history')}>
                <i className="bi bi-clock-history"></i>
                {fr ? 'Historique' : 'Tantara'}
              </button>
              <button onClick={() => goTo('/find-shelter')}>
                <i className="bi bi-building"></i>
                {fr ? 'Trouver refuge' : 'Mitady toerana'}
              </button>

              {user?.role === 'admin' && (
                <>
                  <div className="navbar__dropdown-divider"></div>
                  <div className="navbar__dropdown-section">
                    {fr ? 'Administration' : 'Fitantanana'}
                  </div>
                  <button onClick={() => goTo('/admin/users')}>
                    <i className="bi bi-people"></i> {fr ? 'Utilisateurs' : 'Mpampiasa'}
                  </button>
                  <button onClick={() => goTo('/admin/roads')}>
                    <i className="bi bi-signpost-split"></i> {fr ? 'Gestion routes' : 'Lalana'}
                  </button>
                  <button onClick={() => goTo('/admin/dangers')}>
                    <i className="bi bi-radioactive"></i> {fr ? 'Zones dangereuses' : 'Faritra mampidi-doza'}
                  </button>
                  <button onClick={() => goTo('/admin/stats')}>
                    <i className="bi bi-bar-chart"></i> {fr ? 'Statistiques' : 'Isa'}
                  </button>
                  <button onClick={() => goTo('/admin/alerts')}>
                    <i className="bi bi-bell"></i> {fr ? 'Gérer les alertes' : 'Fitantanana fampitandremana'}
                  </button>
                  <button onClick={() => goTo('/admin/emergency')}>
                    <i className="bi bi-shield-lock"></i> {fr ? 'Code urgence' : 'Kaody maika'}
                  </button>
                </>
              )}

              {user?.role === 'agent' && (
                <>
                  <div className="navbar__dropdown-divider"></div>
                  <button onClick={() => goTo('/agent/people')}>
                    <i className="bi bi-people"></i> {fr ? 'Gestion personnes' : 'Fitantanana olona'}
                  </button>
                  <button onClick={() => goTo('/agent/register')}>
                    <i className="bi bi-qr-code-scan"></i> {fr ? 'Registre' : 'Rejisitra'}
                  </button>
                </>
              )}

              <div className="navbar__dropdown-divider"></div>
              <button onClick={handleLogout} className="navbar__logout-btn">
                <i className="bi bi-box-arrow-right"></i>
                {fr ? 'Déconnexion' : 'Hivoaka'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}