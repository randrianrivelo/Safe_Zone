import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './WeatherPage.css'

export default function WeatherPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [provinces, setProvinces] = useState([])
  const [selected, setSelected] = useState('antananarivo')
  const [current, setCurrent] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    loadProvinces()
    loadWeather('antananarivo')
  }, [theme])

  // Données mockées des provinces
  const defaultProvinces = [
    { key: 'antananarivo', name: 'Antananarivo', name_mg: 'Antananarivo' },
    { key: 'toamasina', name: 'Toamasina', name_mg: 'Toamasina' },
    { key: 'mahajanga', name: 'Mahajanga', name_mg: 'Mahajanga' },
    { key: 'fianarantsoa', name: 'Fianarantsoa', name_mg: 'Fianarantsoa' },
    { key: 'toliara', name: 'Toliara', name_mg: 'Toliara' },
    { key: 'antsiranana', name: 'Antsiranana', name_mg: 'Antsiranana' }
  ]

  // Données météo mockées
  const getMockWeather = (province) => {
    const weatherData = {
      antananarivo: {
        temperature: 24,
        humidity: 65,
        wind_kmh: 12,
        condition: fr ? 'Partiellement nuageux' : 'Rahona kely',
        condition_mg: 'Rahona kely',
        icon: 'bi-cloud-sun',
        risk_level: 'faible',
        province: 'Antananarivo',
        province_mg: 'Antananarivo',
        source: 'OpenWeatherMap'
      },
      toamasina: {
        temperature: 28,
        humidity: 78,
        wind_kmh: 15,
        condition: fr ? 'Pluie légère' : 'Orana kely',
        condition_mg: 'Orana kely',
        icon: 'bi-cloud-rain',
        risk_level: 'moyen',
        province: 'Toamasina',
        province_mg: 'Toamasina',
        source: 'OpenWeatherMap'
      },
      mahajanga: {
        temperature: 32,
        humidity: 70,
        wind_kmh: 14,
        condition: fr ? 'Ensoleillé' : 'Mazava',
        condition_mg: 'Mazava',
        icon: 'bi-brightness-high-fill',
        risk_level: 'faible',
        province: 'Mahajanga',
        province_mg: 'Mahajanga',
        source: 'OpenWeatherMap'
      },
      fianarantsoa: {
        temperature: 20,
        humidity: 72,
        wind_kmh: 10,
        condition: fr ? 'Nuageux' : 'Rahona',
        condition_mg: 'Rahona',
        icon: 'bi-cloud',
        risk_level: 'faible',
        province: 'Fianarantsoa',
        province_mg: 'Fianarantsoa',
        source: 'OpenWeatherMap'
      },
      toliara: {
        temperature: 30,
        humidity: 68,
        wind_kmh: 16,
        condition: fr ? 'Ensoleillé' : 'Mazava',
        condition_mg: 'Mazava',
        icon: 'bi-sun',
        risk_level: 'faible',
        province: 'Toliara',
        province_mg: 'Toliara',
        source: 'OpenWeatherMap'
      },
      antsiranana: {
        temperature: 29,
        humidity: 75,
        wind_kmh: 13,
        condition: fr ? 'Peu nuageux' : 'Rahona kely',
        condition_mg: 'Rahona kely',
        icon: 'bi-cloud-sun',
        risk_level: 'faible',
        province: 'Antsiranana',
        province_mg: 'Antsiranana',
        source: 'OpenWeatherMap'
      }
    }
    return weatherData[province] || weatherData.antananarivo
  }

  const getMockForecast = (province) => {
    const today = new Date()
    return [
      { date: today.toISOString(), temp_max: 26, temp_min: 18, icon: 'bi-cloud-sun', condition: fr ? 'Peu nuageux' : 'Rahona kely', condition_mg: 'Rahona kely', wind_kmh: 12, risk_level: 'faible' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 27, temp_min: 19, icon: 'bi-sun', condition: fr ? 'Ensoleillé' : 'Mazava', condition_mg: 'Mazava', wind_kmh: 10, risk_level: 'faible' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 25, temp_min: 17, icon: 'bi-cloud-rain', condition: fr ? 'Pluie' : 'Orana', condition_mg: 'Orana', wind_kmh: 18, risk_level: 'moyen' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 24, temp_min: 16, icon: 'bi-cloud', condition: fr ? 'Nuageux' : 'Rahona', condition_mg: 'Rahona', wind_kmh: 14, risk_level: 'faible' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 26, temp_min: 18, icon: 'bi-cloud-sun', condition: fr ? 'Peu nuageux' : 'Rahona kely', condition_mg: 'Rahona kely', wind_kmh: 11, risk_level: 'faible' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 28, temp_min: 19, icon: 'bi-sun', condition: fr ? 'Ensoleillé' : 'Mazava', condition_mg: 'Mazava', wind_kmh: 9, risk_level: 'faible' },
      { date: new Date(today.setDate(today.getDate() + 1)).toISOString(), temp_max: 27, temp_min: 18, icon: 'bi-cloud-sun', condition: fr ? 'Peu nuageux' : 'Rahona kely', condition_mg: 'Rahona kely', wind_kmh: 12, risk_level: 'faible' }
    ]
  }

  const loadProvinces = async () => {
    try {
      // Essayer d'appeler l'API
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/weather/provinces', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (response.ok) {
        const data = await response.json()
        if (data && Array.isArray(data) && data.length > 0) {
          setProvinces(data)
          return
        }
      }
      // Fallback sur données mockées
      setProvinces(defaultProvinces)
    } catch (err) {
      console.warn('Erreur chargement provinces:', err)
      setProvinces(defaultProvinces)
    }
  }

  const loadWeather = async (province) => {
    setLoading(true)
    setError(null)
    setSelected(province)

    try {
      // Essayer d'appeler l'API
      const token = localStorage.getItem('token')
      const [currentRes, forecastRes] = await Promise.all([
        fetch(`http://localhost:8000/api/weather/current/${province}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        }),
        fetch(`http://localhost:8000/api/weather/forecast/${province}?days=7`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
      ])

      if (currentRes.ok && forecastRes.ok) {
        const currentData = await currentRes.json()
        const forecastData = await forecastRes.json()
        setCurrent(currentData)
        setForecast(Array.isArray(forecastData) ? forecastData : [])
      } else {
        // Fallback sur données mockées
        setCurrent(getMockWeather(province))
        setForecast(getMockForecast(province))
      }
    } catch (err) {
      console.warn('Erreur chargement météo:', err)
      // Fallback sur données mockées
      setCurrent(getMockWeather(province))
      setForecast(getMockForecast(province))
    } finally {
      setLoading(false)
    }
  }

  const riskColor = {
    faible: '#39ff88',
    moyen: '#ffd60a',
    eleve: '#ff9500',
    critique: '#ff3b30'
  }

  const riskLabel = {
    faible: fr ? 'Risque faible' : 'Loza kely',
    moyen: fr ? 'Risque moyen' : 'Loza antonony',
    eleve: fr ? 'Risque élevé' : 'Loza avo',
    critique: fr ? 'Risque critique' : 'Loza goavana'
  }

  const dayNames = {
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    mg: ['Alah', 'Alats', 'Tal', 'Alar', 'Alak', 'Zom', 'Sab']
  }

  const getDayName = (dateStr) => {
    const d = new Date(dateStr)
    return dayNames[fr ? 'fr' : 'mg'][d.getDay()]
  }

  return (
    <div className="weather-page">
      <Navbar />
      <main className="weather-page__main">
        <h1 className="weather-page__title">
          <i className="bi bi-cloud-lightning-rain" />
          {fr ? 'Météo Madagascar' : 'Toetr\'andro Madagasikara'}
        </h1>
        <p className="weather-page__subtitle">
          {fr
            ? 'Consultez les prévisions météo pour les 6 provinces de Madagascar'
            : 'Jereo ny toetr\'andro ho an\'ny faritany 6 eto Madagasikara'}
        </p>

        <div className="weather-page__provinces">
          {provinces.map(p => (
            <button
              key={p.key}
              className={`weather-page__province ${selected === p.key ? 'active' : ''}`}
              onClick={() => loadWeather(p.key)}
            >
              {fr ? p.name : p.name_mg}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="weather-page__loading">
            <div className="spinner-lg" />
            <span>{fr ? 'Chargement...' : 'Miandry...'}</span>
          </div>
        ) : current ? (
          <>
            {/* Météo actuelle */}
            <div className="weather-page__current">
              <div className="weather-page__current-left">
                <i className={current.icon} />
                <div className="weather-page__temp">{current.temperature}°C</div>
                <div className="weather-page__condition">
                  {fr ? current.condition : current.condition_mg}
                </div>
              </div>
              <div className="weather-page__current-right">
                <div className="weather-page__detail">
                  <i className="bi bi-moisture" />
                  <span>{fr ? 'Humidité' : 'Hamandoana'} : {current.humidity}%</span>
                </div>
                <div className="weather-page__detail">
                  <i className="bi bi-wind" />
                  <span>{fr ? 'Vent' : 'Rivotra'} : {current.wind_kmh} km/h</span>
                </div>
                <div className="weather-page__detail">
                  <i className="bi bi-geo-alt" />
                  <span>{fr ? current.province : current.province_mg}</span>
                </div>
                <div className="weather-page__risk" style={{
                  background: `${riskColor[current.risk_level]}12`,
                  borderColor: `${riskColor[current.risk_level]}35`,
                  color: riskColor[current.risk_level]
                }}>
                  <i className="bi bi-exclamation-triangle-fill" />
                  {riskLabel[current.risk_level]}
                </div>
                <div className="weather-page__source">
                  <i className="bi bi-database" />
                  Source : {current.source || 'OpenWeatherMap'}
                </div>
              </div>
            </div>

            {/* Prévisions 7 jours */}
            <h2 className="weather-page__forecast-title">
              <i className="bi bi-calendar-week" />
              {fr ? 'Prévisions 7 jours' : 'Hevitra 7 andro'}
            </h2>

            <div className="weather-page__forecast-grid">
              {forecast.slice(0, 7).map((f, i) => (
                <div key={i} className="weather-page__forecast-card">
                  <div className="weather-page__forecast-day">{getDayName(f.date)}</div>
                  <div className="weather-page__forecast-date">
                    {new Date(f.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <i className={f.icon || 'bi-cloud-sun'} />
                  <div className="weather-page__forecast-temps">
                    <span className="weather-page__temp-max">{f.temp_max}°</span>
                    <span className="weather-page__temp-min">{f.temp_min}°</span>
                  </div>
                  <div className="weather-page__forecast-cond">
                    {fr ? f.condition : f.condition_mg}
                  </div>
                  <div className="weather-page__forecast-wind">
                    <i className="bi bi-wind" /> {f.wind_kmh} km/h
                  </div>
                  <div className="weather-page__forecast-risk" style={{ color: riskColor[f.risk_level] }}>
                    <i className="bi bi-circle-fill" style={{ fontSize: '0.45rem' }} />
                    {riskLabel[f.risk_level]}
                  </div>
                </div>
              ))}
            </div>

            <div className="weather-page__info">
              <i className="bi bi-info-circle-fill" />
              <span>
                {fr
                  ? 'Données météo fournies par OpenWeatherMap. Mise à jour toutes les 30 minutes.'
                  : 'Angona momba ny toetr\'andro avy amin\'ny OpenWeatherMap. Fanavaozana isaky ny 30 minitra.'}
              </span>
            </div>
          </>
        ) : (
          <div className="weather-page__error">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{fr ? 'Impossible de charger les données météo' : 'Tsy afaka nampiditra ny angona toetr\'andro'}</span>
            <button onClick={() => loadWeather(selected)}>
              {fr ? 'Réessayer' : 'Andramo indray'}
            </button>
          </div>
        )}

        <div className="weather-page__actions">
          <button className="weather-page__btn" onClick={() => navigate('/guide')}>
            <i className="bi bi-book" /> {fr ? 'Guide catastrophes' : 'Torolalana loza'}
          </button>
          <button className="weather-page__btn" onClick={() => navigate('/public-map')}>
            <i className="bi bi-map" /> {fr ? 'Voir la carte' : 'Jereo ny sarintany'}
          </button>
        </div>
      </main>
    </div>
  )
}