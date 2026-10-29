import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'  // ← .stores et non ../../stores
import { useAuthStore } from './stores/authStore'    // ← .stores
import { useAlertStore } from './stores/alertStore'  // ← .stores
import ToastNotification from './components/ui/ToastNotification'
import LoadingScreen from './components/ui/LoadingScreen'
import ErrorBoundary from './components/ui/ErrorBoundary'
import AdminEmergencySettings from './pages/admin/AdminEmergencySettings'
// import { useWebSocket } from './hooks/useWebSocket'

// ============================================================
// PAGES PUBLIQUES
// ============================================================
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import GuidePage from './pages/public/GuidePage'
import WeatherPage from './pages/public/WeatherPage'
import EmergencyNumbers from './pages/public/EmergencyNumbers'
import AboutPage from './pages/public/AboutPage'
import FaqPage from './pages/public/FaqPage'
import PublicMapPage from './pages/public/PublicMapPage'
import PublicStats from './pages/public/PublicStats'

// ============================================================
// PAGES CITOYEN
// ============================================================
import DashboardPage from './pages/citizen/DashboardPage'
import MapPage from './pages/citizen/MapPage'
import EmergencyPage from './pages/citizen/EmergencyPage'
import ProfilePage from './pages/citizen/ProfilePage'
import ReportPage from './pages/citizen/ReportPage'
import HistoryPage from './pages/citizen/HistoryPage'
import FindShelter from './pages/citizen/FindShelter'
import UserSettings from './pages/citizen/UserSettings'
import WeatherCitizen from './pages/citizen/WeatherCitizen'
import NotificationsPage from './pages/citizen/NotificationsPage'

// ============================================================
// PAGES AGENT
// ============================================================
import AgentDashboard from './pages/agent/AgentDashboard'
import AgentPeople from './pages/agent/AgentPeople'
import AgentRegister from './pages/agent/AgentRegister'
import AgentSettings from './pages/agent/AgentSettings'

// ============================================================
// PAGES ADMIN
// ============================================================
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShelters from './pages/admin/AdminShelters'
import AdminRoads from './pages/admin/AdminRoads'
import AdminAlerts from './pages/admin/AdminAlerts'
import AdminDangers from './pages/admin/AdminDangers'
import AdminReports from './pages/admin/AdminReports'
import AdminUsers from './pages/admin/AdminUsers'
import AdminStats from './pages/admin/AdminStats'
import AdminSettings from './pages/admin/AdminSettings'
import AdminMap from './pages/admin/AdminMap'
import AdminAgents from './pages/admin/AdminAgents'
import AdminLogs from './pages/admin/AdminLogs'
import AdminSystem from './pages/admin/AdminSystem'

const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingScreen isLoading={true} />
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { initTheme } = useThemeStore()
  const { isAuthenticated, isLoading } = useAuthStore()
  const { alerts, fetchAlerts, startPolling, stopPolling } = useAlertStore()
  // const { isConnected, alerts: wsAlerts, unreadCount: wsUnreadCount } = useWebSocket()
  const [toastAlerts, setToastAlerts] = useState([])
  const [displayedAlertIds, setDisplayedAlertIds] = useState(() => new Set())
  const [appLoading, setAppLoading] = useState(true)
  const [hasBootstrappedAlerts, setHasBootstrappedAlerts] = useState(false)

  useEffect(() => {
    initTheme()
    const timer = setTimeout(() => setAppLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let cleanupPolling = null

    if (isAuthenticated && !isLoading) {
      fetchAlerts(true)
      stopPolling()
      cleanupPolling = null
    } else {
      stopPolling()
    }

    return () => {
      if (cleanupPolling) {
        cleanupPolling()
      }
    }
  }, [isAuthenticated, isLoading, stopPolling, fetchAlerts])

  useEffect(() => {
    if (!isAuthenticated) return
    if (hasBootstrappedAlerts) return

    const activeAlerts = Array.isArray(alerts) ? alerts : []
    const ids = activeAlerts.map(a => a.id)

    setToastAlerts(prev => [...activeAlerts.slice(0, 5), ...prev].slice(0, 5))
    setDisplayedAlertIds(new Set([...displayedAlertIds, ...ids]))
    setHasBootstrappedAlerts(true)
  }, [alerts, isAuthenticated, hasBootstrappedAlerts, displayedAlertIds])

  const removeToast = (id) => {
    setToastAlerts(prev => prev.filter(t => t.id !== id))
    setDisplayedAlertIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  if (appLoading) {
    return <LoadingScreen isLoading={true} />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* PUBLIQUES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/emergency-numbers" element={<EmergencyNumbers />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/public-map" element={<PublicMapPage />} />
          <Route path="/public-stats" element={<PublicStats />} />

          {/* CITOYEN */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
          <Route path="/citizen/weather" element={<PrivateRoute><WeatherCitizen /></PrivateRoute>} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/find-shelter" element={<PrivateRoute><FindShelter /></PrivateRoute>} />
          <Route path="/user/settings" element={<PrivateRoute><UserSettings /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />

          {/* AGENT */}
          <Route path="/agent/dashboard" element={<PrivateRoute roles={['agent', 'admin']}><AgentDashboard /></PrivateRoute>} />
          <Route path="/agent/people" element={<PrivateRoute roles={['agent', 'admin']}><AgentPeople /></PrivateRoute>} />
          <Route path="/agent/register" element={<PrivateRoute roles={['agent', 'admin']}><AgentRegister /></PrivateRoute>} />
          <Route path="/agent/settings" element={<PrivateRoute roles={['agent', 'admin']}><AgentSettings /></PrivateRoute>} />

          {/* ADMIN */}
          <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/map" element={<PrivateRoute roles={['admin']}><AdminMap /></PrivateRoute>} />
          <Route path="/admin/shelters" element={<PrivateRoute roles={['admin']}><AdminShelters /></PrivateRoute>} />
          <Route path="/admin/roads" element={<PrivateRoute roles={['admin']}><AdminRoads /></PrivateRoute>} />
          <Route path="/admin/alerts" element={<PrivateRoute roles={['admin']}><AdminAlerts /></PrivateRoute>} />
          <Route path="/admin/dangers" element={<PrivateRoute roles={['admin']}><AdminDangers /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute roles={['admin']}><AdminReports /></PrivateRoute>} />
          <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
          <Route path="/admin/agents" element={<PrivateRoute roles={['admin']}><AdminAgents /></PrivateRoute>} />
          <Route path="/admin/stats" element={<PrivateRoute roles={['admin']}><AdminStats /></PrivateRoute>} />
          <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}><AdminSettings /></PrivateRoute>} />
          <Route path="/admin/logs" element={<PrivateRoute roles={['admin']}><AdminLogs /></PrivateRoute>} />
          <Route path="/admin/system" element={<PrivateRoute roles={['admin']}><AdminSystem /></PrivateRoute>} />
          <Route path="/admin/emergency" element={<PrivateRoute roles={['admin']}><AdminEmergencySettings /></PrivateRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toasts notifications */}
        <div className="toast-container">
          {toastAlerts.map(alert => (
            <ToastNotification key={alert.id} alert={alert} onClose={() => removeToast(alert.id)} />
          ))}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}