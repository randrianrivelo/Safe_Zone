import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { shelterService } from '../../services/shelterService'
import './FindShelter.css'

export default function FindShelter() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [shelters, setShelters] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadShelters() {
    try {
      const data = await shelterService.getAll()
      setShelters(data)
    } catch {
      setShelters([])
    }
  }

  // FORCER l'application du thème
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = window.setTimeout(() => {
      loadShelters()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [theme])

  const goToItinerary = (shelter) => {
    localStorage.setItem('selectedShelter', JSON.stringify(shelter))
    navigate('/map')
  }

  const filtered = shelters.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = !filter || s.shelter_type === filter
    return matchSearch && matchFilter
  })

  const types = ['ecole', 'stade', 'eglise', 'gymnase', 'centre_comm', 'hopital', 'caserne', 'marche', 'hangar', 'universite']

  return (
    <div className="find">
      <Navbar />
      <main className="find__main">
        <h1 className="find__title">
          <i className="bi bi-building" />
          {fr ? 'Trouver un refuge' : 'Mitady toerana fiarovana'}
        </h1>

        <div className="find__controls">
          <div className="find__search">
            <i className="bi bi-search" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher...' : 'Mitady...'} />
          </div>
          <select className="find__filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">{fr ? 'Tous les types' : 'Karazana rehetra'}</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <p className="find__count">{filtered.length} {fr ? 'refuges trouvés' : 'toerana hita'}</p>

        <div className="find__grid">
          {filtered.map((s, i) => {
            const cleanName = s.name
              ?.replace(/Ã©/g, 'é')
              ?.replace(/Ã¨/g, 'è')
              ?.replace(/Ãª/g, 'ê')
              ?.replace(/Ã®/g, 'î')
              ?.replace(/Ã´/g, 'ô')
              ?.replace(/Ã»/g, 'û')
              ?.replace(/Ã§/g, 'ç')
              ?.replace(/Ã‰/g, 'É')
              ?.replace(/Ã€/g, 'À')
              ?.replace(/â€/g, '')
              ?.replace(/â€™/g, "'")
              || s.name

            const pct = s.capacity_total ? Math.round((s.current_occupancy / s.capacity_total) * 100) : 0
            const clr = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
            return (
              <div key={i} className="find__card">
                <div className="find__card-header">
                  <div className="find__card-icon"><i className="bi bi-building" /></div>
                  <span className="find__card-type">{s.shelter_type}</span>
                </div>
                <h3>{cleanName}</h3>
                <p className="find__card-address">{s.address || '—'}</p>
                <div className="find__card-bar-wrap">
                  <div className="find__card-bar" style={{ width: `${pct}%`, background: clr }} />
                </div>
                <span className="find__card-cap" style={{ color: clr }}>
                  {s.current_occupancy}/{s.capacity_total} ({pct}%)
                </span>
                <div className="find__card-services">
                  {s.has_water && <i className="bi bi-droplet-fill" style={{ color: '#38bdf8' }} title="Eau" />}
                  {s.has_electricity && <i className="bi bi-lightning-fill" style={{ color: '#ffd60a' }} title="Élec" />}
                  {s.has_medical && <i className="bi bi-heart-pulse-fill" style={{ color: '#ff3b30' }} title="Médical" />}
                  {s.has_food && <i className="bi bi-cup-hot-fill" style={{ color: '#ff9500' }} title="Food" />}
                </div>
                <button className="find__card-btn" onClick={() => goToItinerary(s)}>
                  <i className="bi bi-sign-turn-right" /> {fr ? 'Itinéraire' : 'Lalana'}
                </button>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}