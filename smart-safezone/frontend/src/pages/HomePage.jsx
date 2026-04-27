// src/pages/HomePage.jsx
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { refugeService, zoneService } from '../services/api'

export default function HomePage() {
  const [stats, setStats] = useState({ refuges: 0, totalCapacity: 0, alerts: 0 })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [refugesRes, alertsRes] = await Promise.all([
          refugeService.getAll(),
          zoneService.getAlerts()
        ])
        const refugesData = refugesRes.data
        setStats({
          refuges: refugesData.length,
          totalCapacity: refugesData.reduce((sum, r) => sum + (r.capacity || 0), 0),
          alerts: alertsRes.data.length
        })
      } catch (err) {
        console.error('Erreur:', err)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="hero-section">
      <div className="hero-content px-3">
        {/* Titre */}
        <div className="hero-icon">🌀</div>
        <h1 className="hero-title">Smart SafeZone</h1>
        <h2 className="hero-subtitle">Analamanga 2035</h2>
        <p className="hero-description">
          Application intelligente de guidage vers les zones sûres en cas de catastrophe
          naturelle à Madagascar
        </p>

        {/* Bouton principal */}
        <Link to="/map" className="btn btn-find-refuge mb-5">
          <i className="bi bi-geo-alt-fill"></i>
          TROUVER UN REFUGE MAINTENANT
        </Link>

        {/* Fonctionnalités */}
        <div className="container mt-5">
          <div className="row g-4 mb-5">
            <div className="col-md-4">
              <div className="feature-card">
                <i className="bi bi-map-fill feature-icon" style={{ color: '#42a5f5' }}></i>
                <h3>Carte Interactive</h3>
                <p>
                  Visualisez les refuges, zones dangereuses et itinéraires en temps réel sur
                  une carte interactive
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <i className="bi bi-cpu-fill feature-icon" style={{ color: '#ffb300' }}></i>
                <h3>Algorithmes Intelligents</h3>
                <p>
                  Dijkstra et A* calculent le chemin le plus sûr en évitant les routes
                  détruites et zones inondées
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <i
                  className="bi bi-house-check-fill feature-icon"
                  style={{ color: '#4caf50' }}
                ></i>
                <h3>Refuges Optimisés</h3>
                <p>
                  Trouvez le refuge le plus adapté selon la distance, la capacité et les
                  équipements disponibles
                </p>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="stat-box">
                <div className="stat-number">{stats.refuges}</div>
                <div className="stat-label">
                  <i className="bi bi-house-fill me-1"></i>Refuges actifs
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-box">
                <div className="stat-number">{stats.totalCapacity.toLocaleString()}</div>
                <div className="stat-label">
                  <i className="bi bi-people-fill me-1"></i>Places disponibles
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-box">
                <div className="stat-number">{stats.alerts}</div>
                <div className="stat-label">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>Alertes actives
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}