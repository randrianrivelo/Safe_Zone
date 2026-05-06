import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function Navbar() {
  const loc = useLocation()
  const { theme, toggleTheme } = useTheme()
  const active = (p) => loc.pathname === p ? 'active' : ''

  return (
    <nav className="navbar-sz">
      <Link to="/" className="navbar-logo">
        <div className="logo-icon"><i className="bi bi-shield-fill-check"></i></div>
        <div>
          <span className="logo-text">Smart SafeZone</span>
          <span className="logo-sub">Analamanga 2035</span>
        </div>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={`nav-link-sz ${active('/')}`}>
          <i className="bi bi-house-fill"></i> Accueil
        </Link>
        <Link to="/map" className={`nav-link-sz ${active('/map')}`}>
          <i className="bi bi-map-fill"></i> Carte
        </Link>
        <Link to="/meteo" className={`nav-link-sz ${active('/meteo')}`}>
          <i className="bi bi-cloud-sun-fill"></i> Meteo
        </Link>
        <Link to="/alerts" className={`nav-link-sz ${active('/alerts')}`}>
          <i className="bi bi-exclamation-triangle-fill"></i> Alertes
        </Link>
        <Link to="/admin" className={`nav-link-sz ${active('/admin')}`}>
          <i className="bi bi-grid-fill"></i> Admin
        </Link>
        <Link to="/profile" className={`nav-link-sz ${active('/profile')}`}>
          <i className="bi bi-person-circle"></i> Profil
        </Link>
      </div>

      <div className="navbar-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Changer le theme">
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
        </button>
        <Link to="/map" className="btn-sos">
          <i className="bi bi-exclamation-octagon-fill"></i> SOS
        </Link>
      </div>
    </nav>
  )
}