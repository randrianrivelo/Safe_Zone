import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { weatherService } from '../../services/weatherService'
import './WeatherCitizen.css'

export default function WeatherCitizen() {
  const { theme } = useThemeStore()
  const [provinces, setProvinces] = useState([])
  const [selected, setSelected]   = useState('antananarivo')
  const [current, setCurrent]     = useState(null)
  const [forecast, setForecast]   = useState([])
  const [loading, setLoading]     = useState(false)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadProvinces() {
    try { setProvinces(await weatherService.getProvinces()) }
    catch { setProvinces([]) }
  }

  async function loadWeather(province) {
    setLoading(true)
    setSelected(province)
    try {
      const [cur, fore] = await Promise.all([
        weatherService.getCurrent(province),
        weatherService.getForecast(province, 7)
      ])
      setCurrent(cur)
      setForecast(fore)
    } catch {
      setCurrent(null)
      setForecast([])
    } finally {
      setLoading(false)
    }
  }

  const riskColor = {
    faible:   '#39ff88',
    moyen:    '#ffd60a',
    eleve:    '#ff9500',
    critique: '#ff3b30'
  }

  const riskLabel = {
    faible:   fr ? 'Risque faible'   : 'Loza kely',
    moyen:    fr ? 'Risque moyen'    : 'Loza antonony',
    eleve:    fr ? 'Risque élevé'    : 'Loza avo',
    critique: fr ? 'Risque critique' : 'Loza goavana'
  }

  const dayNames = {
    fr: ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
    mg: ['Alah','Alats','Tal','Alar','Alak','Zom','Sab']
  }

  const getDayName = (dateStr) => {
    const d = new Date(dateStr)
    return dayNames[fr ? 'fr' : 'mg'][d.getDay()]
  }

  // FORCER l'application du thème
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = window.setTimeout(() => {
      loadProvinces()
      loadWeather('antananarivo')
    }, 0)
    return () => window.clearTimeout(timer)
  }, [theme])

  return (
    <div className="weather-c">
      <Navbar />
      <main className="weather-c__main">
        <h1 className="weather-c__title">
          <i className="bi bi-cloud-lightning-rain" />
          {fr ? 'Météo Madagascar' : 'Toetr\'andro Madagasikara'}
        </h1>

        <div className="weather-c__provinces">
          {provinces.map(p => (
            <button key={p.key}
              className={`weather-c__province ${selected === p.key ? 'active' : ''}`}
              onClick={() => loadWeather(p.key)}>
              {fr ? p.name : p.name_mg}
            </button>
          ))}
        </div>

        {loading && (
          <div className="weather-c__loading">
            <div className="spinner-lg" />
            <span>{fr ? 'Chargement...' : 'Miandry...'}</span>
          </div>
        )}

        {current && !loading && (
          <>
            <div className="weather-c__current">
              <div className="weather-c__current-left">
                <i className={current.icon} />
                <div className="weather-c__temp">{current.temperature}°C</div>
                <div className="weather-c__condition">
                  {fr ? current.condition : current.condition_mg}
                </div>
              </div>
              <div className="weather-c__current-right">
                <div className="weather-c__detail">
                  <i className="bi bi-moisture" />
                  <span>{fr ? 'Humidité' : 'Hamandoana'} : {current.humidity}%</span>
                </div>
                <div className="weather-c__detail">
                  <i className="bi bi-wind" />
                  <span>{fr ? 'Vent' : 'Rivotra'} : {current.wind_kmh} km/h</span>
                </div>
                <div className="weather-c__detail">
                  <i className="bi bi-geo-alt" />
                  <span>{fr ? current.province : current.province_mg}</span>
                </div>
                <div className="weather-c__detail">
                  <i className="bi bi-clock" />
                  <span>{fr ? 'Mis à jour' : 'Novaozana'} : {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="weather-c__risk"
                  style={{
                    background:  `${riskColor[current.risk_level]}12`,
                    borderColor: `${riskColor[current.risk_level]}35`,
                    color:        riskColor[current.risk_level]
                  }}>
                  <i className="bi bi-exclamation-triangle-fill" />
                  {riskLabel[current.risk_level]}
                </div>
                <div className="weather-c__source">
                  <i className="bi bi-database" />
                  Source : {current.source}
                </div>
              </div>
            </div>

            {current.waves && (
              <div className="weather-c__waves"
                style={{
                  background:  `${current.waves.color}08`,
                  borderColor: `${current.waves.color}30`
                }}>
                <div className="weather-c__waves-header">
                  <i className="bi bi-tsunami" style={{ color: current.waves.color }} />
                  <strong style={{ color: current.waves.color }}>
                    {fr ? 'État de la mer' : 'Toetry ny ranomasina'}
                  </strong>
                </div>
                <div className="weather-c__waves-details">
                  <div className="weather-c__waves-stat">
                    <i className="bi bi-water" style={{ color: current.waves.color }} />
                    <div>
                      <strong>{current.waves.height_m} m</strong>
                      <span>{fr ? 'Hauteur des vagues' : 'Haavon\'ny onja'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h2 className="weather-c__forecast-title">
              <i className="bi bi-calendar-week" />
              {fr ? 'Prévisions 7 jours' : 'Hevitra 7 andro'}
            </h2>

            <div className="weather-c__forecast-grid">
              {forecast.map((f, i) => (
                <div key={i} className="weather-c__forecast-card">
                  <div className="weather-c__forecast-day">{getDayName(f.date)}</div>
                  <div className="weather-c__forecast-date">
                    {new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <i className={f.icon} />
                  <div className="weather-c__forecast-temps">
                    <span className="weather-c__temp-max">{f.temp_max}°</span>
                    <span className="weather-c__temp-min">{f.temp_min}°</span>
                  </div>
                  <div className="weather-c__forecast-cond">
                    {fr ? f.condition : f.condition_mg}
                  </div>
                  <div className="weather-c__forecast-wind">
                    <i className="bi bi-wind" /> {f.wind_kmh} km/h
                  </div>
                  <div className="weather-c__forecast-risk"
                    style={{ color: riskColor[f.risk_level] }}>
                    <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }} />
                    {riskLabel[f.risk_level]}
                  </div>
                </div>
              ))}
            </div>

            <div className="weather-c__warning">
              <i className="bi bi-info-circle-fill" />
              <span>
                {fr
                  ? 'Données météo en temps réel via OpenWeatherMap.'
                  : 'Angona momba ny toetr\'andro amin\'ny fotoana tena izy.'}
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  )
}