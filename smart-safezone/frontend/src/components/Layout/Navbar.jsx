// src/components/Layout/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path) => (location.pathname === path ? 'active' : '')

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-safezone px-3">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <span style={{ fontSize: '1.8rem' }}>🌀</span>
          <div>
            Smart SafeZone
            <span className="brand-sub">Analamanga 2035</span>
          </div>
        </Link>

        {/* Toggle mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Liens */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">
                <i className="bi bi-house-fill"></i> Accueil
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/map')}`} to="/map">
                <i className="bi bi-map-fill"></i> Carte
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/alerts')}`} to="/alerts">
                <i className="bi bi-exclamation-triangle-fill"></i> Alertes
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/admin')}`} to="/admin">
                <i className="bi bi-gear-fill"></i> Admin
              </Link>
            </li>
          </ul>

          {/* Bouton Urgence */}
          <Link to="/map" className="btn-emergency">
            <i className="bi bi-exclamation-octagon-fill"></i>
            URGENCE
          </Link>
        </div>
      </div>
    </nav>
  )
}