import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { useAlertStore } from '../../stores/alertStore'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminAlerts() {
  const { theme } = useThemeStore()
  const { alerts, fetchAlerts, addAlert, removeAlert } = useAlertStore()
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '',
    message: '',
    alert_type: 'info',
    severity: 'moyen',
    target_district: ''
  })
  const [saving, setSaving] = useState(false)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadAlerts()
  }, [theme])

  const loadAlerts = async () => {
    setLoading(true)
    await fetchAlerts()
    setLoading(false)
  }

  const createAlert = async () => {
    if (!form.title || !form.message) {
      alert(fr ? 'Veuillez remplir le titre et le message' : 'Fenoy ny lohateny sy ny hafatra')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      let cleanToken = token
      if (cleanToken && cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1)
      }

      const response = await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cleanToken}`
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        const newAlert = await response.json()
        addAlert(newAlert)
        setShowForm(false)
        setForm({ title: '', message: '', alert_type: 'info', severity: 'moyen', target_district: '' })
        alert(fr ? 'Alerte créée avec succès !' : 'Fampitandremana noforonina soa aman-tsara !')
      } else {
        throw new Error('Erreur création')
      }
    } catch (err) {
      console.error('Erreur création alerte:', err)
      alert(fr ? 'Erreur lors de la création' : 'Olana tamin\'ny famoronana')
    } finally {
      setSaving(false)
    }
  }

  const deleteAlert = async (id) => {
    if (!window.confirm(fr ? 'Désactiver cette alerte ?' : 'Hofoanana ity fampitandremana ity ?')) return

    try {
      const token = localStorage.getItem('token')
      let cleanToken = token
      if (cleanToken && cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1)
      }

      const response = await fetch(`http://localhost:8000/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      })

      if (response.ok) {
        removeAlert(id)
        alert(fr ? 'Alerte désactivée' : 'Fampitandremana nesorina')
      }
    } catch (err) {
      console.error('Erreur suppression:', err)
    }
  }

  const sevColor = {
    faible: '#39ff88',
    moyen: '#ffd60a',
    eleve: '#ff9500',
    critique: '#ff3b30'
  }

  const sevIcon = {
    faible: 'bi-info-circle-fill',
    moyen: 'bi-exclamation-circle-fill',
    eleve: 'bi-exclamation-triangle-fill',
    critique: 'bi-x-octagon-fill'
  }

  const getSeverityLabel = (severity) => {
    const labels = {
      faible: fr ? 'Faible' : 'Kely',
      moyen: fr ? 'Moyen' : 'Antonony',
      eleve: fr ? 'Élevé' : 'Avo',
      critique: fr ? 'Critique' : 'Goavana'
    }
    return labels[severity] || severity
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-bell" /> {fr ? 'Gestion des alertes' : 'Fitantanana fampitandremana'}</h1>
          <button className="admin-page__create-btn" onClick={() => setShowForm(!showForm)}>
            <i className={`bi bi-${showForm ? 'x' : 'plus-lg'}`} />
            {showForm ? (fr ? 'Annuler' : 'Ajanony') : (fr ? 'Nouvelle alerte' : 'Fampitandremana vaovao')}
          </button>
        </div>

        {/* Formulaire création */}
        {showForm && (
          <div className="admin-page__form">
            <h3>{fr ? 'Créer une alerte' : 'Mamorona fampitandremana'}</h3>
            <div className="admin-page__form-grid">
              <div className="admin-page__form-field">
                <label>{fr ? 'Titre' : 'Lohateny'}</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  placeholder={fr ? 'Titre de l\'alerte...' : 'Lohateny...'}
                />
              </div>
              <div className="admin-page__form-field">
                <label>{fr ? 'District cible' : 'Distrika tanjona'}</label>
                <input
                  value={form.target_district}
                  onChange={(e) => setForm({...form, target_district: e.target.value})}
                  placeholder={fr ? 'Tous les districts' : 'Distrika rehetra'}
                />
              </div>
              <div className="admin-page__form-field">
                <label>{fr ? 'Type' : 'Karazana'}</label>
                <select
                  value={form.alert_type}
                  onChange={(e) => setForm({...form, alert_type: e.target.value})}
                >
                  <option value="info">Info</option>
                  <option value="avertissement">{fr ? 'Avertissement' : 'Fampitandremana'}</option>
                  <option value="urgence">{fr ? 'Urgence' : 'Maika'}</option>
                  <option value="critique">{fr ? 'Critique' : 'Goavana'}</option>
                </select>
              </div>
              <div className="admin-page__form-field">
                <label>{fr ? 'Sévérité' : 'Haben\'ny loza'}</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm({...form, severity: e.target.value})}
                >
                  <option value="faible">{fr ? 'Faible' : 'Kely'}</option>
                  <option value="moyen">{fr ? 'Moyen' : 'Antonony'}</option>
                  <option value="eleve">{fr ? 'Élevé' : 'Avo'}</option>
                  <option value="critique">{fr ? 'Critique' : 'Goavana'}</option>
                </select>
              </div>
              <div className="admin-page__form-field admin-page__form-field--full">
                <label>{fr ? 'Message' : 'Hafatra'}</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  placeholder={fr ? 'Message de l\'alerte...' : 'Hafatry ny fampitandremana...'}
                />
              </div>
            </div>
            <button className="admin-page__submit-btn" onClick={createAlert} disabled={saving}>
              {saving
                ? <><div className="spinner-sm" /> {fr ? 'Envoi...' : 'Mandefa...'}</>
                : <><i className="bi bi-send" /> {fr ? 'Envoyer l\'alerte' : 'Alefaso'}</>
              }
            </button>
          </div>
        )}

        {/* Liste alertes */}
        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : alerts.length === 0 ? (
          <div className="admin-page__empty">
            <i className="bi bi-bell-slash" />
            <span>{fr ? 'Aucune alerte active' : 'Tsy misy fampitandremana mavitrika'}</span>
          </div>
        ) : (
          <div className="admin-page__alerts-list">
            {alerts.map((a, i) => (
              <div key={i} className="admin-page__alert-item" style={{ borderLeftColor: sevColor[a.severity] || '#ffd60a' }}>
                <div className="admin-page__alert-header">
                  <i className={sevIcon[a.severity] || 'bi-info-circle-fill'} style={{ color: sevColor[a.severity] || '#ffd60a' }} />
                  <strong>{a.title}</strong>
                  <span
                    className="admin-page__alert-badge"
                    style={{
                      background: `${sevColor[a.severity] || '#ffd60a'}15`,
                      color: sevColor[a.severity] || '#ffd60a'
                    }}
                  >
                    {getSeverityLabel(a.severity)}
                  </span>
                  <span className="admin-page__alert-type">{a.alert_type || 'info'}</span>
                  <button className="admin-page__delete-btn" onClick={() => deleteAlert(a.id)}>
                    <i className="bi bi-trash" />
                  </button>
                </div>
                <p className="admin-page__alert-msg">{a.message}</p>
                <span className="admin-page__alert-date">
                  {a.created_at ? new Date(a.created_at).toLocaleString('fr-FR') : new Date().toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}