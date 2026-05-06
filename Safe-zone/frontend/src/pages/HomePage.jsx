import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { refugeService, zoneService } from '../services/api'
import AnimatedCounter from '../components/UI/AnimatedCounter'

function useScrollAnimation() {
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) e.target.classList.add('visible')
    }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return ref
}

function SlideIn({ children, dir = 'left', className = '' }) {
  const ref = useScrollAnimation()
  return <div ref={ref} className={`${dir === 'left' ? 'slide-in' : dir === 'right' ? 'slide-in-right' : 'fade-in'} ${className}`}>{children}</div>
}

export default function HomePage() {
  const [stats, setStats] = useState({ refuges: 0, capacity: 0, alerts: 0, routes: 3 })

  useEffect(() => {
    const load = async () => {
      const [r, a] = await Promise.all([refugeService.getAll(), zoneService.getAlerts()])
      setStats({ refuges: r.data.length, capacity: r.data.reduce((s, x) => s + (x.capacity || 0), 0), alerts: a.data.length, routes: 3 })
    }
    load()
  }, [])

  return (
    <div style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      {/* HERO */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-icon"><i className="bi bi-shield-fill-check"></i></div>
          <h1 className="hero-title">Smart SafeZone</h1>
          <h2 className="hero-subtitle">Analamanga 2035</h2>
          <p className="hero-description">
            Plateforme intelligente de guidage vers les zones sures en cas de catastrophe naturelle a Madagascar
          </p>
          <Link to="/map" className="btn-hero">
            <i className="bi bi-geo-alt-fill"></i> TROUVER UN REFUGE
          </Link>

          <div className="feature-grid">
            <SlideIn dir="left"><div className="feature-card"><span className="f-icon"><i className="bi bi-map-fill"></i></span><h3>Carte Interactive</h3><p>Refuges, zones dangereuses et itineraires en temps reel</p></div></SlideIn>
            <SlideIn dir="up"><div className="feature-card"><span className="f-icon"><i className="bi bi-cpu-fill"></i></span><h3>Algorithmes A*</h3><p>Chemin le plus sur en evitant les routes detruites</p></div></SlideIn>
            <SlideIn dir="right"><div className="feature-card"><span className="f-icon"><i className="bi bi-house-check-fill"></i></span><h3>Refuges Optimises</h3><p>Distance, capacite et equipements analyses</p></div></SlideIn>
          </div>

          <div className="stats-row">
            <div className="stat-box"><div className="stat-number"><AnimatedCounter end={stats.refuges} /></div><div className="stat-label"><i className="bi bi-house-fill"></i> Refuges</div></div>
            <div className="stat-box"><div className="stat-number"><AnimatedCounter end={stats.capacity} /></div><div className="stat-label"><i className="bi bi-people-fill"></i> Places</div></div>
            <div className="stat-box"><div className="stat-number"><AnimatedCounter end={stats.alerts} /></div><div className="stat-label"><i className="bi bi-bell-fill"></i> Alertes</div></div>
          </div>
        </div>
      </div>

      {/* HISTOIRE CYCLONES */}
      <div className="cyclone-section">
        <SlideIn dir="left">
          <div className="cyclone-card">
            <h3><i className="bi bi-tornado" style={{ color: 'var(--danger)' }}></i> Comprendre les cyclones a Madagascar</h3>
            <p>Madagascar est l'un des pays les plus exposes aux cyclones tropicaux dans l'ocean Indien. Chaque annee, entre novembre et avril, la Grande Ile fait face a plusieurs systemes cycloniques pouvant causer des degats considerables.</p>
          </div>
        </SlideIn>

        <SlideIn dir="right">
          <div className="cyclone-card">
            <h3><i className="bi bi-diagram-3-fill" style={{ color: 'var(--primary)' }}></i> Formation et trajectoires</h3>
            <p>Les cyclones tropicaux se forment au-dessus des eaux chaudes de l'ocean Indien (temperature superieure a 26C). Ils suivent generalement une trajectoire ouest-sud-ouest, touchant d'abord la cote est de Madagascar avant de traverser l'ile.</p>
            <ul>
              <li><i className="bi bi-check-circle-fill"></i> Categorie 1 : vents de 119-153 km/h</li>
              <li><i className="bi bi-check-circle-fill"></i> Categorie 2 : vents de 154-177 km/h</li>
              <li><i className="bi bi-check-circle-fill"></i> Categorie 3 : vents de 178-208 km/h — <strong style={{ color: 'var(--danger)' }}>Cyclone GAMANE actuel</strong></li>
              <li><i className="bi bi-check-circle-fill"></i> Categorie 4-5 : vents superieurs a 209 km/h</li>
            </ul>
          </div>
        </SlideIn>

        <SlideIn dir="left">
          <div className="cyclone-card">
            <h3><i className="bi bi-shield-fill-check" style={{ color: 'var(--safe)' }}></i> Comportements a adopter</h3>
            <ul>
              <li><i className="bi bi-check-circle-fill"></i> Rejoignez le refuge le plus proche IMMEDIATEMENT</li>
              <li><i className="bi bi-check-circle-fill"></i> Evitez les zones basses et les rivages</li>
              <li><i className="bi bi-check-circle-fill"></i> Emportez eau, nourriture, medicaments et documents</li>
              <li><i className="bi bi-check-circle-fill"></i> Chargez vos appareils electroniques</li>
              <li><i className="bi bi-check-circle-fill"></i> Ecoutez les consignes de la protection civile</li>
              <li><i className="bi bi-check-circle-fill"></i> N'utilisez PAS la route si elle est signalee comme endommagee</li>
            </ul>
          </div>
        </SlideIn>
      </div>
    </div>
  )
}