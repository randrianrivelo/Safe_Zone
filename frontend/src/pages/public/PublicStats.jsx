import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { shelterService } from '../../services/shelterService'
import './PublicStats.css'

export default function PublicStats() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [stats, setStats] = useState(null)
  const [shelters, setShelters] = useState([])
  const [loading, setLoading] = useState(true)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = setTimeout(() => {
      loadData(setLoading, setShelters, setStats)
    }, 0)
    return () => clearTimeout(timer)
  }, [theme])

  const loadData = async () => {
    setLoading(true)
    try {
      const shelterData = await shelterService.getAll()
      setShelters(shelterData)

      // Calculer les statistiques
      const totalShelters = shelterData.length
      const totalCapacity = shelterData.reduce((sum, s) => sum + (s.capacity_total || 0), 0)
      const totalOccupancy = shelterData.reduce((sum, s) => sum + (s.current_occupancy || 0), 0)
      const availableSpots = totalCapacity - totalOccupancy

      // Refuges par district
      const districts = {}
      shelterData.forEach(s => {
        const district = s.district || 'Autre'
        districts[district] = (districts[district] || 0) + 1
      })

      // Occupation par type
      const types = {}
      shelterData.forEach(s => {
        const type = s.shelter_type || 'Autre'
        types[type] = (types[type] || 0) + 1
      })

      // Refuges saturés (≥90%)
      const saturated = shelterData.filter(s => {
        const pct = s.capacity_total ? (s.current_occupancy / s.capacity_total) * 100 : 0
        return pct >= 90
      }).length

      // Refuges libres (<50%)
      const free = shelterData.filter(s => {
        const pct = s.capacity_total ? (s.current_occupancy / s.capacity_total) * 100 : 0
        return pct < 50
      }).length

      setStats({
        totalShelters,
        totalCapacity,
        totalOccupancy,
        availableSpots,
        saturated,
        free,
        districts,
        types
      })
    } catch (err) {
      console.error('Erreur chargement stats:', err)
      // Données mockées
      setStats({
        totalShelters: 88,
        totalCapacity: 70755,
        totalOccupancy: 24850,
        availableSpots: 45905,
        saturated: 8,
        free: 45,
        districts: {
          'Antananarivo Renivohitra': 16,
          'Antananarivo Atsimondrano': 17,
          'Antananarivo Avaradrano': 12,
          'Ambohidratrimo': 10,
          'Ankazobe': 8,
          'Anjozorobe': 5,
          'Manjakandriana': 7,
          'Andramasina': 4,
          'Arivonimamo': 5,
          'Ambatolampy': 4
        },
        types: {
          'ecole': 35,
          'eglise': 16,
          'stade': 5,
          'gymnase': 5,
          'centre_comm': 12,
          'hopital': 3,
          'caserne': 3,
          'marche': 5,
          'hangar': 5,
          'universite': 1
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const getTopDistricts = () => {
    if (!stats?.districts) return []
    return Object.entries(stats.districts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const getTopTypes = () => {
    if (!stats?.types) return []
    return Object.entries(stats.types)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }

  const typeLabels = {
    ecole: fr ? 'Écoles' : 'Sekoly',
    eglise: fr ? 'Églises' : 'Fiangonana',
    stade: fr ? 'Stades' : 'Kianja',
    gymnase: fr ? 'Gymnases' : 'Gymnase',
    centre_comm: fr ? 'Centres communautaires' : 'Foibe fiaraha-monina',
    hopital: fr ? 'Hôpitaux' : 'Hopitaly',
    caserne: fr ? 'Caserne' : 'Toby',
    marche: fr ? 'Marchés' : 'Tsena',
    hangar: fr ? 'Hangars' : 'Hangar',
    universite: fr ? 'Universités' : 'Oniversite'
  }

  return (
    <div className="public-stats">
      <Navbar />
      <main className="public-stats__main">
        <h1 className="public-stats__title">
          <i className="bi bi-bar-chart-fill" />
          {fr ? 'Statistiques publiques' : 'Antontanisa ho an\'ny rehetra'}
        </h1>
        <p className="public-stats__subtitle">
          {fr
            ? 'Découvrez les chiffres clés du réseau de refuges d\'Analamanga'
            : 'Hahita ny isa manan-danja momba ny toerana fiarovana ao Analamanga'}
        </p>

        {loading ? (
          <div className="public-stats__loading"><div className="spinner-lg" /></div>
        ) : (
          <>
            {/* Cartes KPI */}
            <div className="public-stats__kpis">
              <div className="public-stats__kpi">
                <i className="bi bi-building" />
                <span className="public-stats__kpi-val">{stats?.totalShelters}</span>
                <span className="public-stats__kpi-label">{fr ? 'Refuges' : 'Toerana'}</span>
              </div>
              <div className="public-stats__kpi">
                <i className="bi bi-people-fill" />
                <span className="public-stats__kpi-val">{stats?.totalCapacity?.toLocaleString('fr-FR')}</span>
                <span className="public-stats__kpi-label">{fr ? 'Capacité totale' : 'Haben\'ny rehetra'}</span>
              </div>
              <div className="public-stats__kpi">
                <i className="bi bi-person-fill" />
                <span className="public-stats__kpi-val">{stats?.totalOccupancy?.toLocaleString('fr-FR')}</span>
                <span className="public-stats__kpi-label">{fr ? 'Personnes abritées' : 'Olona voaaro'}</span>
              </div>
              <div className="public-stats__kpi">
                <i className="bi bi-door-open" />
                <span className="public-stats__kpi-val">{stats?.availableSpots?.toLocaleString('fr-FR')}</span>
                <span className="public-stats__kpi-label">{fr ? 'Places disponibles' : 'Toerana misy'}</span>
              </div>
            </div>

            {/* Refuges par district */}
            <div className="public-stats__card">
              <h2><i className="bi bi-geo-alt" /> {fr ? 'Refuges par district' : 'Toerana isaky ny distrika'}</h2>
              <div className="public-stats__bar-chart">
                {getTopDistricts().map(([district, count], i) => {
                  const percent = (count / stats?.totalShelters) * 100
                  return (
                    <div key={i} className="public-stats__bar-row">
                      <span className="public-stats__bar-name">{district}</span>
                      <div className="public-stats__bar-track">
                        <div className="public-stats__bar-fill" style={{ width: `${percent}%`, background: 'var(--accent)' }} />
                      </div>
                      <span className="public-stats__bar-val">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Occupation */}
            <div className="public-stats__grid">
              <div className="public-stats__card">
                <h2><i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }} /> {fr ? 'Refuges saturés' : 'Toerana feno'}</h2>
                <div className="public-stats__big-number" style={{ color: '#ff3b30' }}>{stats?.saturated}</div>
                <p>{fr ? 'refuges à plus de 90% de capacité' : 'toerana mihoatra ny 90% no feno'}</p>
              </div>
              <div className="public-stats__card">
                <h2><i className="bi bi-check-circle-fill" style={{ color: '#39ff88' }} /> {fr ? 'Refuges disponibles' : 'Toerana malalaka'}</h2>
                <div className="public-stats__big-number" style={{ color: '#39ff88' }}>{stats?.free}</div>
                <p>{fr ? 'refuges à moins de 50% de capacité' : 'toerana latsaky ny 50% no feno'}</p>
              </div>
            </div>

            {/* Types de refuges */}
            <div className="public-stats__card">
              <h2><i className="bi bi-building" /> {fr ? 'Types de refuges' : 'Karazan-toerana'}</h2>
              <div className="public-stats__types-grid">
                {getTopTypes().map(([type, count], i) => (
                  <div key={i} className="public-stats__type-item">
                    <div className="public-stats__type-icon">
                      <i className="bi bi-building" />
                    </div>
                    <span className="public-stats__type-name">{typeLabels[type] || type}</span>
                    <span className="public-stats__type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Taux d'occupation */}
            <div className="public-stats__card">
              <h2><i className="bi bi-pie-chart" /> {fr ? "Taux d'occupation global" : 'Tahan\'ny fampiasana ankapobeny'}</h2>
              <div className="public-stats__occupancy">
                <div className="public-stats__occupancy-bar">
                  <div
                    className="public-stats__occupancy-fill"
                    style={{ width: `${Math.round((stats?.totalOccupancy / stats?.totalCapacity) * 100)}%` }}
                  />
                </div>
                <span className="public-stats__occupancy-text">
                  {Math.round((stats?.totalOccupancy / stats?.totalCapacity) * 100)}% {fr ? 'occupé' : 'feno'}
                </span>
              </div>
            </div>
          </>
        )}

        <div className="public-stats__actions">
          <button className="public-stats__btn" onClick={() => navigate('/public-map')}>
            <i className="bi bi-map" /> {fr ? 'Voir la carte' : 'Jereo ny sarintany'}
          </button>
          <button className="public-stats__btn" onClick={() => navigate('/login')}>
            <i className="bi bi-person-plus" /> {fr ? 'Créer un compte' : 'Hamorona kaonty'}
          </button>
        </div>
      </main>
    </div>
  )
}