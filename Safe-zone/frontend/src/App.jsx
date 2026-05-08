// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Navbar        from './components/Layout/Navbar';
import Footer        from './components/Layout/Footer';
import AlertBanner   from './components/Alert/AlertBanner';
import ThemeToggle   from './components/UI/ThemeToggle';
import ToastContainer from './components/UI/ToastContainer';

import HomePage   from './pages/HomePage';
import MapPage    from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import AdminPage  from './pages/AdminPage';
import LoginPage  from './pages/LoginPage';

import './styles/global.css';
import './App.css';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <AlertBanner />
      <main className="app-main">
        <Routes>
          <Route path="/"       element={<HomePage />} />
          <Route path="/map"    element={<MapPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/admin"  element={
            <ProtectedRoute adminOnly>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ThemeToggle />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppLayout />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}