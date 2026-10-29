import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import { reportService } from '../../services/reportService'
import Navbar from '../../components/layout/Navbar'
import './ReportPage.css'

export default function ReportPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [form, setForm] = useState({ report_type: '', description: '' })
  const [position, setPosition] = useState(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setPosition({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => {}
      )
    }
  }, [theme])

  const types = [
    { value: 'route_endommagee', icon: 'bi-signpost-split', label: fr ? 'Route endommagée' : 'Lalana simba', color: '#ff9500' },
    { value: 'inondation', icon: 'bi-water', label: fr ? 'Inondation' : 'Tondra-drano', color: '#38bdf8' },
    { value: 'refuge_plein', icon: 'bi-building-fill-x', label: fr ? 'Refuge saturé' : 'Toerana feno', color: '#ff9500' },
    { value: 'zone_danger', icon: 'bi-radioactive', label: fr ? 'Zone dangereuse' : 'Toerana mampidi-doza', color: '#ff3b30' },
    { value: 'besoin_urgent', icon: 'bi-heart-pulse-fill', label: fr ? 'Besoin urgent' : 'Ilaina haingana', color: '#ff3b30' },
    { value: 'alerte_cyclone', icon: 'bi-cloud-lightning-rain-fill', label: fr ? 'Alerte cyclone' : 'Fampitandremana rivo-doza', color: '#a855f7' },
    { value: 'autre', icon: 'bi-three-dots', label: fr ? 'Autre' : 'Hafa', color: '#94a3b8' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.report_type) {
      setError(fr ? 'Veuillez choisir un type de signalement' : 'Mifidiana karazana fampandrenesana')
      return
    }
    setLoading(true)
    setError('')

    try {
      const reportData = {
        report_type: form.report_type,
        description: form.description,
        latitude: position?.lat || -18.9137,
        longitude: position?.lon || 47.5361
      }

      await reportService.create(reportData)
      setSent(true)
    } catch (err) {
      console.error('Erreur signalement:', err)
      setError(err?.message || 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="report">
        <Navbar />
        <main className="report__main">
          <div className="report__success-card">
            <div className="report__success-icon">
              <i className="bi bi-check-circle-fill" />
            </div>
            <h2>{fr ? 'Signalement envoyé !' : 'Mampandrenesana voaray !'}</h2>
            <p>
              {fr
                ? 'Votre signalement a bien été reçu par les autorités. Un administrateur va le vérifier dans les plus brefs délais.'
                : 'Ny fampandrenesanao dia voaray tsara. Ny mpitantana dia hanamarina izany haingana.'}
            </p>
            <p className="report__success-note">
              <i className="bi bi-bell" />
              {fr
                ? 'Vous serez notifié(e) dès qu\'une action sera prise.'
                : 'Hisy fampandrenesana rahefa misy hetsika.'}
            </p>
            <div className="report__success-actions">
              <button className="report__back-btn" onClick={() => navigate('/dashboard')}>
                <i className="bi bi-grid" /> {fr ? 'Retour au dashboard' : 'Hiverina'}
              </button>
              <button className="report__new-btn" onClick={() => setSent(false)}>
                <i className="bi bi-plus-circle" /> {fr ? 'Nouveau signalement' : 'Mampandrenesana vaovao'}
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="report">
      <Navbar />
      <main className="report__main">
        <h1 className="report__title">
          <i className="bi bi-exclamation-diamond" />
          {fr ? 'Signaler un danger' : 'Mampandrenesana loza'}
        </h1>
        <p className="report__subtitle">
          {fr
            ? 'Aidez les autorités en signalant les situations dangereuses dans votre secteur.'
            : 'Ampio ny manam-pahefana amin\'ny alalan\'ny fampandrenesana ny loza.'}
        </p>

        <form className="report__form" onSubmit={handleSubmit}>
          {/* Type de signalement */}
          <div className="report__section">
            <h3><i className="bi bi-tag" /> {fr ? 'Type de danger' : 'Karazana loza'}</h3>
            <div className="report__types">
              {types.map((t, i) => (
                <button key={i} type="button"
                  className={`report__type-btn ${form.report_type === t.value ? 'active' : ''}`}
                  style={{
                    borderColor: form.report_type === t.value ? t.color : undefined,
                    background: form.report_type === t.value ? `${t.color}12` : undefined,
                    color: form.report_type === t.value ? t.color : undefined
                  }}
                  onClick={() => { setForm({...form, report_type: t.value}); setError('') }}>
                  <i className={t.icon} style={{ color: t.color }} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="report__section">
            <h3><i className="bi bi-chat-left-text" /> {fr ? 'Description' : 'Famaritana'}</h3>
            <textarea
              className="report__textarea"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder={fr
                ? 'Décrivez la situation en détail... (optionnel mais recommandé)'
                : 'Lazao miaramankatoky ny zava-misy...'}
            />
          </div>

          {/* Position GPS */}
          <div className="report__section">
            <h3><i className="bi bi-geo-alt" /> {fr ? 'Position GPS' : 'Toerana GPS'}</h3>
            {position ? (
              <div className="report__gps report__gps--ok">
                <div className="report__gps-icon">
                  <i className="bi bi-geo-alt-fill" />
                </div>
                <div>
                  <strong>{fr ? 'Position détectée' : 'Toerana hita'}</strong>
                  <span>{position.lat.toFixed(4)}, {position.lon.toFixed(4)}</span>
                </div>
                <i className="bi bi-check-circle-fill" style={{ color: '#39ff88', marginLeft:'auto' }} />
              </div>
            ) : (
              <div className="report__gps report__gps--no">
                <div className="report__gps-icon" style={{ background: 'rgba(255,59,48,0.1)', borderColor:'rgba(255,59,48,0.2)' }}>
                  <i className="bi bi-geo-alt" style={{ color: '#ff3b30' }} />
                </div>
                <div>
                  <strong>{fr ? 'Position non disponible' : 'Tsy hita ny toerana'}</strong>
                  <span>{fr ? 'Activez la géolocalisation' : 'Alefa ny GPS'}</span>
                </div>
                <i className="bi bi-exclamation-circle" style={{ color: '#ff9500', marginLeft:'auto' }} />
              </div>
            )}
          </div>

          {/* Erreur */}
          {error && (
            <div className="report__error">
              <i className="bi bi-exclamation-triangle-fill" />
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" className="report__submit" disabled={loading || !form.report_type}>
            {loading
              ? <><div className="spinner-sm" /> {fr ? 'Envoi en cours...' : 'Mandefa...'}</>
              : <><i className="bi bi-send-fill" /> {fr ? 'Envoyer le signalement' : 'Alefaso ny fampandrenesana'}</>
            }
          </button>
        </form>
      </main>
    </div>
  )
}