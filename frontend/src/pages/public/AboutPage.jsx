import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AboutPage.css'

export default function AboutPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  return (
    <div className="about-page">
      <Navbar />
      <main className="about-page__main">
        <h1 className="about-page__title">
          <i className="bi bi-info-circle-fill" />
          {fr ? 'À propos' : 'Mombamomba'}
        </h1>

        {/* Mission */}
        <div className="about-page__card">
          <div className="about-page__card-icon">
            <i className="bi bi-shield-check" />
          </div>
          <h2>{fr ? 'Notre mission' : 'Ny tanjonay'}</h2>
          <p>
            {fr
              ? 'SafeZone Analamanga 2035 a pour mission de protéger la population de la région d\'Analamanga en cas de catastrophe naturelle. Notre application permet de trouver rapidement un refuge sûr, d\'éviter les zones dangereuses et de recevoir des alertes en temps réel.'
              : 'Ny tanjon\'ny SafeZone Analamanga 2035 dia ny fiarovana ny mponina ao amin\'ny faritra Analamanga rehefa misy loza voajanahary. Ny fampiharanay dia ahafahana mahita toerana fiarovana haingana, misoroka ny faritra mampidi-doza ary mahazo fampitandremana amin\'ny fotoana tena izy.'}
          </p>
        </div>

        {/* Valeurs */}
        <div className="about-page__card">
          <div className="about-page__card-icon">
            <i className="bi bi-star-fill" />
          </div>
          <h2>{fr ? 'Nos valeurs' : 'Ny soatoavina'}</h2>
          <ul className="about-page__list">
            <li><i className="bi bi-shield-check" /> {fr ? 'Sécurité avant tout' : 'Fiarovana aloha'}</li>
            <li><i className="bi bi-people-fill" /> {fr ? 'Proximité avec les citoyens' : 'Mifanakaiky amin\'ny mponina'}</li>
            <li><i className="bi bi-lightbulb" /> {fr ? 'Innovation technologique' : 'Fandrosoana ara-teknolojia'}</li>
            <li><i className="bi bi-globe" /> {fr ? 'Rapidité d\'intervention' : 'Haingam-pandeha'}</li>
          </ul>
        </div>

        {/* Technologies */}
        <div className="about-page__card">
          <div className="about-page__card-icon">
            <i className="bi bi-cpu" />
          </div>
          <h2>{fr ? 'Technologies utilisées' : 'Teknolojia ampiasaina'}</h2>
          <div className="about-page__tech-grid">
            <div className="about-page__tech-item"><i className="bi bi-code-square" />React</div>
            <div className="about-page__tech-item"><i className="bi bi-database" />PostgreSQL</div>
            <div className="about-page__tech-item"><i className="bi bi-lightning-charge" />FastAPI</div>
            <div className="about-page__tech-item"><i className="bi bi-map" />Leaflet</div>
            <div className="about-page__tech-item"><i className="bi bi-graph-up" />Dijkstra / A*</div>
            <div className="about-page__tech-item"><i className="bi bi-qr-code" />QR Code</div>
          </div>
        </div>

        {/* Chiffres clés */}
        <div className="about-page__card">
          <div className="about-page__card-icon">
            <i className="bi bi-bar-chart" />
          </div>
          <h2>{fr ? 'Chiffres clés' : 'Isa manan-danja'}</h2>
          <div className="about-page__stats-grid">
            <div className="about-page__stat">
              <span className="about-page__stat-val">88+</span>
              <span className="about-page__stat-label">{fr ? 'Refuges' : 'Toerana'}</span>
            </div>
            <div className="about-page__stat">
              <span className="about-page__stat-val">70 755</span>
              <span className="about-page__stat-label">{fr ? 'Places' : 'Toerana misy'}</span>
            </div>
            <div className="about-page__stat">
              <span className="about-page__stat-val">10</span>
              <span className="about-page__stat-label">{fr ? 'Districts' : 'Distrika'}</span>
            </div>
            <div className="about-page__stat">
              <span className="about-page__stat-val">24/7</span>
              <span className="about-page__stat-label">{fr ? 'Disponible' : 'Miasa'}</span>
            </div>
          </div>
        </div>

        {/* Partenaires */}
        <div className="about-page__card">
          <div className="about-page__card-icon">
            <i className="bi bi-building" />
          </div>
          <h2>{fr ? 'Partenaires' : 'Mpiara-miasa'}</h2>
          <div className="about-page__partners">
            <div className="about-page__partner"><i className="bi bi-shield-shaded" /><span>BNGRC</span></div>
            <div className="about-page__partner"><i className="bi bi-hospital" /><span>Croix-Rouge</span></div>
            <div className="about-page__partner"><i className="bi bi-mortarboard" /><span>ESMIA Innovation</span></div>
            <div className="about-page__partner"><i className="bi bi-fire" /><span>{fr ? 'Pompiers' : 'Mpamono afo'}</span></div>
          </div>
        </div>

        <div className="about-page__actions">
          <button className="about-page__btn" onClick={() => navigate('/guide')}>
            <i className="bi bi-book" /> {fr ? 'Guide catastrophes' : 'Torolalana loza'}
          </button>
          <button className="about-page__btn" onClick={() => navigate('/emergency-numbers')}>
            <i className="bi bi-telephone-fill" /> {fr ? 'Numéros d\'urgence' : 'Laharan\'ny maika'}
          </button>
        </div>
      </main>
    </div>
  )
}