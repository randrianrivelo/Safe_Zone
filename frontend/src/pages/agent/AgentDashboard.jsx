import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AgentDashboard.css'

export default function AgentDashboard() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [shelter, setShelter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alertMessage, setAlertMessage] = useState(null)
  const [people, setPeople] = useState({
    total: 0,
    children: 0,
    elderly: 0,
    injured: 0,
    families: 0,
    arrivalsToday: 0,
    departuresToday: 0
  })
  const [resources, setResources] = useState({
    water: 65,
    food: 42,
    medicine: 78,
    blankets: 53
  })
  const [recentArrivals, setRecentArrivals] = useState([])
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadData() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // 1. Charger mon profil pour avoir le shelter_id
      const meRes = await fetch('http://localhost:8000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const me = await meRes.json()

      if (me.shelter_id) {
        // 2. Charger les détails du refuge
        const sRes = await fetch(`http://localhost:8000/api/shelters/${me.shelter_id}`)
        const sData = await sRes.json()
        setShelter(sData)

        // 3. Charger les personnes pour les stats
        const pRes = await fetch('http://localhost:8000/api/shelters/people', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const pData = await pRes.json()
        const currentPeople = pData.filter(p => p.status === 'present')

        setPeople({
          total: currentPeople.length,
          children: currentPeople.filter(p => p.age < 18).length,
          elderly: currentPeople.filter(p => p.age >= 60).length,
          injured: currentPeople.filter(p => p.is_injured).length,
          families: new Set(currentPeople.filter(p => p.family_id).map(p => p.family_id)).size,
          arrivalsToday: pData.filter(p => new Date(p.entry_date).toDateString() === new Date().toDateString()).length,
          departuresToday: pData.filter(p => p.exit_time && new Date(p.exit_time).toDateString() === new Date().toDateString()).length
        })

        setRecentArrivals(pData.slice(0, 4))

        // Alerte saturation
        const occupancyPercent = (currentPeople.length / sData.capacity_total) * 100
        if (occupancyPercent >= 90) {
          setAlertMessage({
            type: 'danger',
            title: fr ? '⚠️ Refuge presque saturé !' : '⚠️ Toerana efa feno saika!',
            message: fr
              ? `Le refuge est à ${Math.round(occupancyPercent)}% de sa capacité.`
              : `Efa ${Math.round(occupancyPercent)}% no feno ny toerana.`
          })
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // FORCER l'application du thème
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = window.setTimeout(() => {
      loadData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [theme])

  const getOccupancyPercent = () => {
    if (!shelter) return 0
    return Math.round((shelter.current_occupancy / shelter.capacity_total) * 100)
  }

  const getOccupancyColor = (percent) => {
    if (percent >= 90) return '#ff3b30'
    if (percent >= 70) return '#ff9500'
    return '#39ff88'
  }

  const getResourceColor = (value) => {
    if (value <= 30) return '#ff3b30'
    if (value <= 60) return '#ff9500'
    return '#39ff88'
  }

  return (
    <div className="agent-page">
      <Navbar />
      <main className="agent-page__main">

        <div className="agent-page__header">
          <div>
            <h1><i className="bi bi-person-badge" /> {fr ? 'Dashboard Agent' : 'Sehatra Agent'}</h1>
            <p>{fr ? 'Gestion de votre refuge' : 'Fitantanana ny toerana fiarovana anao'}</p>
          </div>
          <button className="agent-page__help-btn" onClick={() => navigate('/guide')}>
            <i className="bi bi-question-circle" /> {fr ? 'Aide' : 'Fanampiana'}
          </button>
        </div>

        {/* Alerte refuge plein */}
        {alertMessage && (
          <div className={`agent-page__alert agent-page__alert--${alertMessage.type}`}>
            <i className="bi bi-exclamation-triangle-fill" />
            <div>
              <strong>{alertMessage.title}</strong>
              <p>{alertMessage.message}</p>
            </div>
            <button className="agent-page__alert-close" onClick={() => setAlertMessage(null)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {/* Alerte ressource basse */}
        {resources.water <= 30 && (
          <div className="agent-page__alert agent-page__alert--warning">
            <i className="bi bi-droplet-fill" />
            <div>
              <strong>{fr ? '⚠️ Alerte : Stock d\'eau bas !' : '⚠️ Fampitandremana : Rano lany saika!'}</strong>
              <p>{fr ? 'Le stock d\'eau est critique. Faites une demande urgente.' : 'Efa lany saika ny rano. Miangavy haingana.'}</p>
            </div>
            <button className="agent-page__alert-close" onClick={() => setResources({...resources, water: 35})}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="agent-page__loading"><div className="spinner-lg" /></div>
        ) : (
          <>
            <div className="agent-page__shelter-card">
              <div className="agent-page__shelter-header">
                <div className="agent-page__shelter-icon">
                  <i className="bi bi-building" />
                </div>
                <div className="agent-page__shelter-info">
                  <h2>{shelter?.name}</h2>
                  <span><i className="bi bi-geo-alt" /> {shelter?.district}</span>
                  <span><i className="bi bi-telephone" /> {shelter?.contact_phone}</span>
                </div>
                <div className="agent-page__shelter-status">
                  <span className={`agent-page__status-badge agent-page__status-badge--${shelter?.status}`}>
                    {fr ? 'Ouvert' : 'Misokatra'}
                  </span>
                </div>
              </div>
              <div className="agent-page__shelter-capacity">
                <div className="agent-page__capacity-bar-wrap">
                  <div className="agent-page__capacity-bar"
                    style={{
                      width: `${getOccupancyPercent()}%`,
                      background: getOccupancyColor(getOccupancyPercent())
                    }} />
                </div>
                <div className="agent-page__capacity-stats">
                  <span><i className="bi bi-people-fill" /> {shelter?.current_occupancy} / {shelter?.capacity_total}</span>
                  <span style={{ color: getOccupancyColor(getOccupancyPercent()) }}>
                    {getOccupancyPercent()}% {fr ? 'occupé' : 'feno'}
                  </span>
                </div>
              </div>
            </div>

            <div className="agent-page__stats">
              <div className="agent-page__stat-card">
                <div className="agent-page__stat-icon" style={{ background: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.2)' }}>
                  <i className="bi bi-people-fill" style={{ color: '#a855f7' }} />
                </div>
                <div className="agent-page__stat-info">
                  <span className="agent-page__stat-val">{people.total}</span>
                  <span className="agent-page__stat-label">{fr ? 'Personnes totales' : 'Olona rehetra'}</span>
                </div>
              </div>
              <div className="agent-page__stat-card">
                <div className="agent-page__stat-icon" style={{ background: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.2)' }}>
                  <i className="bi bi-person-standing" style={{ color: '#38bdf8' }} />
                </div>
                <div className="agent-page__stat-info">
                  <span className="agent-page__stat-val">{people.children}</span>
                  <span className="agent-page__stat-label">{fr ? 'Enfants' : 'Ankizy'}</span>
                </div>
              </div>
              <div className="agent-page__stat-card">
                <div className="agent-page__stat-icon" style={{ background: 'rgba(255,149,0,0.1)', borderColor: 'rgba(255,149,0,0.2)' }}>
                  <i className="bi bi-person-walking" style={{ color: '#ff9500' }} />
                </div>
                <div className="agent-page__stat-info">
                  <span className="agent-page__stat-val">{people.elderly}</span>
                  <span className="agent-page__stat-label">{fr ? 'Personnes âgées' : 'Loholona'}</span>
                </div>
              </div>
              <div className="agent-page__stat-card">
                <div className="agent-page__stat-icon" style={{ background: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.2)' }}>
                  <i className="bi bi-heart-pulse-fill" style={{ color: '#ff3b30' }} />
                </div>
                <div className="agent-page__stat-info">
                  <span className="agent-page__stat-val">{people.injured}</span>
                  <span className="agent-page__stat-label">{fr ? 'Blessés' : 'Maratra'}</span>
                </div>
              </div>
            </div>

            <div className="agent-page__movements">
              <div className="agent-page__movement-card">
                <i className="bi bi-arrow-right-circle-fill" style={{ color: '#39ff88' }} />
                <div>
                  <span className="agent-page__movement-val">{people.arrivalsToday}</span>
                  <span className="agent-page__movement-label">{fr ? 'Arrivées aujourd\'hui' : 'Fahatongavana anio'}</span>
                </div>
              </div>
              <div className="agent-page__movement-card">
                <i className="bi bi-arrow-left-circle-fill" style={{ color: '#ff9500' }} />
                <div>
                  <span className="agent-page__movement-val">{people.departuresToday}</span>
                  <span className="agent-page__movement-label">{fr ? 'Départs aujourd\'hui' : 'Fivoahana anio'}</span>
                </div>
              </div>
              <div className="agent-page__movement-card">
                <i className="bi bi-house-fill" style={{ color: '#a855f7' }} />
                <div>
                  <span className="agent-page__movement-val">{people.families}</span>
                  <span className="agent-page__movement-label">{fr ? 'Familles' : 'Fianakaviana'}</span>
                </div>
              </div>
            </div>

            <div className="agent-page__section">
              <h2 className="agent-page__section-title">
                <i className="bi bi-box-seam" />
                {fr ? 'Ressources disponibles' : 'Fitaovana misy'}
              </h2>
              <div className="agent-page__resources-grid">
                <div className="agent-page__resource-card">
                  <i className="bi bi-droplet-fill" style={{ color: '#38bdf8' }} />
                  <div className="agent-page__resource-info">
                    <span className="agent-page__resource-label">{fr ? 'Eau' : 'Rano'}</span>
                    <div className="agent-page__resource-bar-wrap">
                      <div className="agent-page__resource-bar"
                        style={{
                          width: `${resources.water}%`,
                          background: getResourceColor(resources.water)
                        }} />
                    </div>
                    <span className="agent-page__resource-val">{resources.water}%</span>
                  </div>
                  <button className="agent-page__request-btn">
                    <i className="bi bi-send" /> {fr ? 'Demander' : 'Mangataka'}
                  </button>
                </div>
                <div className="agent-page__resource-card">
                  <i className="bi bi-cup-hot-fill" style={{ color: '#ff9500' }} />
                  <div className="agent-page__resource-info">
                    <span className="agent-page__resource-label">{fr ? 'Nourriture' : 'Sakafo'}</span>
                    <div className="agent-page__resource-bar-wrap">
                      <div className="agent-page__resource-bar"
                        style={{
                          width: `${resources.food}%`,
                          background: getResourceColor(resources.food)
                        }} />
                    </div>
                    <span className="agent-page__resource-val">{resources.food}%</span>
                  </div>
                  <button className="agent-page__request-btn">
                    <i className="bi bi-send" /> {fr ? 'Demander' : 'Mangataka'}
                  </button>
                </div>
                <div className="agent-page__resource-card">
                  <i className="bi bi-heart-pulse-fill" style={{ color: '#ff3b30' }} />
                  <div className="agent-page__resource-info">
                    <span className="agent-page__resource-label">{fr ? 'Médicaments' : 'Fanafody'}</span>
                    <div className="agent-page__resource-bar-wrap">
                      <div className="agent-page__resource-bar"
                        style={{
                          width: `${resources.medicine}%`,
                          background: getResourceColor(resources.medicine)
                        }} />
                    </div>
                    <span className="agent-page__resource-val">{resources.medicine}%</span>
                  </div>
                  <button className="agent-page__request-btn">
                    <i className="bi bi-send" /> {fr ? 'Demander' : 'Mangataka'}
                  </button>
                </div>
                <div className="agent-page__resource-card">
                  <i className="bi bi-tsunami" style={{ color: '#a855f7' }} />
                  <div className="agent-page__resource-info">
                    <span className="agent-page__resource-label">{fr ? 'Couvertures' : 'Kofehy'}</span>
                    <div className="agent-page__resource-bar-wrap">
                      <div className="agent-page__resource-bar"
                        style={{
                          width: `${resources.blankets}%`,
                          background: getResourceColor(resources.blankets)
                        }} />
                    </div>
                    <span className="agent-page__resource-val">{resources.blankets}%</span>
                  </div>
                  <button className="agent-page__request-btn">
                    <i className="bi bi-send" /> {fr ? 'Demander' : 'Mangataka'}
                  </button>
                </div>
              </div>
            </div>

            <div className="agent-page__bottom">
              <div className="agent-page__arrivals">
                <h3 className="agent-page__panel-title">
                  <i className="bi bi-clock-history" />
                  {fr ? 'Dernières arrivées' : 'Fahatongavana farany'}
                </h3>
                <div className="agent-page__arrivals-list">
                  {recentArrivals.map((a, i) => (
                    <div key={i} className="agent-page__arrival-item">
                      <div className="agent-page__arrival-icon">
                        <i className="bi bi-person-circle" />
                      </div>
                      <div className="agent-page__arrival-info">
                        <strong>{a.name}</strong>
                        <span>{fr ? 'Famille de' : 'Fianakaviana'} {a.family} {fr ? 'personnes' : 'olona'}</span>
                        {a.needs && <span className="agent-page__arrival-need">{a.needs}</span>}
                      </div>
                      <span className="agent-page__arrival-time">{a.time}</span>
                    </div>
                  ))}
                </div>
                <button className="agent-page__view-all" onClick={() => navigate('/agent/register')}>
                  {fr ? 'Voir tout le registre' : 'Hijery ny rejisitra rehetra'}
                  <i className="bi bi-arrow-right" />
                </button>
              </div>

              <div className="agent-page__actions">
                <h3 className="agent-page__panel-title">
                  <i className="bi bi-lightning-charge" />
                  {fr ? 'Actions rapides' : 'Hetsika haingana'}
                </h3>
                <div className="agent-page__actions-list">
                  <button className="agent-page__action-btn" onClick={() => navigate('/agent/people')}>
                    <i className="bi bi-people" />
                    <span>{fr ? 'Gérer les personnes' : 'Fitantanana olona'}</span>
                    <i className="bi bi-chevron-right" />
                  </button>
                  <button className="agent-page__action-btn" onClick={() => navigate('/agent/register')}>
                    <i className="bi bi-qr-code-scan" />
                    <span>{fr ? 'Enregistrer entrée/sortie' : 'Soraty ny fidirana/fivoahana'}</span>
                    <i className="bi bi-chevron-right" />
                  </button>
                  <button className="agent-page__action-btn" onClick={() => navigate('/report')}>
                    <i className="bi bi-exclamation-diamond" />
                    <span>{fr ? 'Signaler un besoin urgent' : 'Mampandre ilaina haingana'}</span>
                    <i className="bi bi-chevron-right" />
                  </button>
                  <button className="agent-page__action-btn" onClick={() => navigate('/map')}>
                    <i className="bi bi-map" />
                    <span>{fr ? 'Voir la carte des refuges' : 'Hijery ny sarintany'}</span>
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}