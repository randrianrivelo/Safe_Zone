// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CommuniqueProvider } from './context/CommuniqueContext'
import ToastNotification from './components/UI/ToastNotification'
import DynamicBackground from './components/UI/DynamicBackground'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import HomePage from './pages/HomePage'
import MapPage from './pages/MapPage'
import AlertsPage from './pages/AlertsPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import MeteoPage from './pages/MeteoPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth()
  if (!currentUser) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

function AppLayout() {
  const { currentUser } = useAuth()

  return (
    <>
      <DynamicBackground showControls={!!currentUser} />
      <ToastNotification />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="*"
          element={
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <div style={{ flex: 1, paddingTop: 64, overflow: 'hidden' }}>
                <Routes>
                  <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                  <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
                  <Route path="/meteo" element={<ProtectedRoute><MeteoPage /></ProtectedRoute>} />
                  <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CommuniqueProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </CommuniqueProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}