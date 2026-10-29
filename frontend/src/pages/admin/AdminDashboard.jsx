import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useAlertStore } from '../../stores/alertStore'
import Navbar from '../../components/layout/Navbar'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const { fetchAlerts } = useAlertStore()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simDone, setSimDone] = useState(false)
  const [simProgress, setSimProgress] = useState(0)
  const [showSimModal, setShowSimModal] = useState(false)
  const [cycloneName, setCycloneName] = useState('')
  const [simType, setSimType] = useState('cyclone')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  async function loadStats() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:8000/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    } catch {
      setStats({
        total_shelters: 88,
        open_shelters: 85,
        total_capacity: 70755,
        total_occupancy: 0,
        available_spots: 70755,
        blocked_roads: 3,
        active_alerts: 3,
        active_dangers: 6,
        pending_reports: 0
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    const timer = setTimeout(() => {
      loadStats()
    }, 0)
    return () => clearTimeout(timer)
  }, [theme])

  // Simulation de catastrophe avec nom personnalisé
  const simulateDisaster = async (name, type) => {
    if (simulating) return

    setSimulating(true)
    setSimProgress(0)
    setSimDone(false)

    try {
      const raw = localStorage.getItem('token')
      const token = raw ? raw.replace(/^"|"$/g, '') : null

      const typeLabels = {
        cyclone: { emoji: '🌀', title: 'CYCLONE', label: 'cyclone', color: '#a855f7' },
        eboulement: { emoji: '⛰️', title: 'ÉBOULEMENT', label: 'éboulement', color: '#ff9500' },
        inondation: { emoji: '🌊', title: 'INONDATION', label: 'inondation', color: '#38bdf8' }
      }

      const t = typeLabels[type] || typeLabels.cyclone
      const disasterName = name || (type === 'cyclone' ? 'TROPICAL' : type.toUpperCase())

      // Étape 1 : Créer l'alerte principale (20%)
      setSimProgress(20)
      await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${t.emoji} ${t.title} ${disasterName} — Alerte maximale`,
          message: fr
            ? `Un ${t.label} ${disasterName} touche la région Analamanga. Évacuation immédiate recommandée. Rejoignez le refuge le plus proche via SafeZone.`
            : `Misy ${t.label} ${disasterName} midina amin'ny faritra Analamanga. Mila miala avy hatrany. Mankanesa amin'ny toerana fiarovana akaiky indrindra.`,
          alert_type: 'urgence',
          severity: 'critique',
          target_district: 'Tous les districts Analamanga'
        })
      })

      // Étape 2 : Bloquer des routes (40%)
      setSimProgress(40)
      const roadIds = [15, 16, 17, 18, 19]
      for (const id of roadIds) {
        await fetch(`http://localhost:8000/api/roads/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'inonde', is_passable: false, danger_level: 3 })
        })
      }

      // Étape 3 : Saturer des refuges (60%)
      setSimProgress(60)
      const shelterIds = [2, 3, 4, 7, 11]
      for (const id of shelterIds) {
        await fetch(`http://localhost:8000/api/shelters/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'sature', current_occupancy: 500 })
        })
      }

      // Étape 4 : Ajouter une zone dangereuse (80%)
      setSimProgress(80)
      await fetch('http://localhost:8000/api/dangers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${t.emoji} Zone ${disasterName}`,
          danger_type: type,
          center_lat: -18.9137,
          center_lon: 47.5361,
          radius_km: 15.0,
          severity: 'critique',
          description: fr ? `Zone touchée par ${disasterName}` : `Faritra tratry ny ${disasterName}`
        })
      })

      // Étape 5 : Alerte complémentaire (90%)
      setSimProgress(90)
      await fetch('http://localhost:8000/api/alerts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: fr ? `⚠️ ÉVACUATION — Zones à risque` : `⚠️ MAKA ALAO — Faritra mampidi-doza`,
          message: fr
            ? `Les zones suivantes sont en évacuation immédiate : Andavamamba, Isotry, Ankasina, Antohomadinika, Ambohimahitsy.`
            : `Ireto faritra manaraka ireto dia mila miala avy hatrany : Andavamamba, Isotry, Ankasina, Antohomadinika, Ambohimahitsy.`,
          alert_type: 'urgence',
          severity: 'critique',
          target_district: 'Antananarivo Renivohitra'
        })
      })

      // Étape 6 : Finaliser (100%)
      setSimProgress(100)
      await loadStats()
      await fetchAlerts(true)

      setSimDone(true)
      setTimeout(() => setSimDone(false), 8000)

    } catch (e) {
      console.error('Erreur simulation:', e)
      alert(fr ? 'Erreur lors de la simulation' : 'Olana tamin\'ny simulation')
    } finally {
      setSimulating(false)
      setSimProgress(0)
    }
  }

  const statCards = stats ? [
    { icon: 'bi-building', val: stats.total_shelters, label: fr ? 'Refuges total' : 'Toerana rehetra', color: 'var(--accent)' },
    { icon: 'bi-check-circle', val: stats.open_shelters, label: fr ? 'Refuges ouverts' : 'Toerana misokatra', color: '#39ff88' },
    { icon: 'bi-people-fill', val: stats.available_spots?.toLocaleString('fr-FR'), label: fr ? 'Places disponibles' : 'Toerana misy', color: 'var(--cyan)' },
    { icon: 'bi-signpost-split', val: stats.blocked_roads, label: fr ? 'Routes bloquées' : 'Lalana voasakana', color: '#ff9500' },
    { icon: 'bi-exclamation-triangle', val: stats.active_alerts, label: fr ? 'Alertes actives' : 'Fampitandremana', color: '#ff3b30' },
    { icon: 'bi-radioactive', val: stats.active_dangers, label: fr ? 'Zones dangereuses' : 'Toerana mampidi-doza', color: '#ff3b30' },
    { icon: 'bi-flag', val: stats.pending_reports, label: fr ? 'Signalements' : 'Mampandre', color: '#ffd60a' },
    { icon: 'bi-people', val: stats.total_occupancy, label: fr ? 'Personnes abritées' : 'Olona voaaro', color: 'var(--accent)' }
  ] : []

  const quickActions = [
    { icon: 'bi-building', label: fr ? 'Gérer les refuges' : 'Tantana toerana', path: '/admin/shelters', color: 'var(--accent)' },
    { icon: 'bi-signpost-split', label: fr ? 'Gérer les routes' : 'Tantana lalana', path: '/admin/roads', color: '#ff9500' },
    { icon: 'bi-bell', label: fr ? 'Gérer les alertes' : 'Tantana fampitandremana', path: '/admin/alerts', color: '#ff3b30' },
    { icon: 'bi-radioactive', label: fr ? 'Zones dangereuses' : 'Toerana mampidi-doza', path: '/admin/dangers', color: '#ff3b30' },
    { icon: 'bi-flag', label: fr ? 'Signalements' : 'Mampandre', path: '/admin/reports', color: '#ffd60a' },
    { icon: 'bi-people', label: fr ? 'Utilisateurs' : 'Mpampiasa', path: '/admin/users', color: 'var(--cyan)' },
    { icon: 'bi-bar-chart', label: fr ? 'Statistiques' : 'Isa', path: '/admin/stats', color: 'var(--accent)' },
    { icon: 'bi-gear', label: fr ? 'Paramètres' : 'Fitamboatra', path: '/admin/settings', color: 'var(--text-muted)' }
  ]

  return (
    <div className="admin-dash">
      <Navbar />
      <main className="admin-dash__main">

        <div className="admin-dash__header">
          <div>
            <h1><i className="bi bi-speedometer2" /> {fr ? 'Dashboard Admin' : 'Sehatra Admin'}</h1>
            <p>{fr ? 'Vue globale du système SafeZone Analamanga 2035' : 'Fijery ankapobeny ny rafitra SafeZone'}</p>
          </div>

          <button className="admin-dash__sim-btn" onClick={() => setShowSimModal(true)}>
            <i className="bi bi-tornado" /> {fr ? 'Simuler une catastrophe' : 'Simulation loza'}
          </button>
        </div>

        {/* Modal de simulation */}
        {showSimModal && (
          <div className="sim-modal">
            <div className="sim-modal-content">
              <h3>{fr ? 'Simuler une catastrophe' : 'Simulation loza'}</h3>

              <div className="sim-modal-field">
                <label>{fr ? 'Type de catastrophe' : 'Karazana loza'}</label>
                <select value={simType} onChange={(e) => setSimType(e.target.value)}>
                  <option value="cyclone">🌪️ {fr ? 'Cyclone' : 'Rivo-doza'}</option>
                  <option value="eboulement">⛰️ {fr ? 'Éboulement' : 'Fihotsahan-tany'}</option>
                  <option value="inondation">🌊 {fr ? 'Inondation' : 'Tondra-drano'}</option>
                </select>
              </div>

              <div className="sim-modal-field">
                <label>{fr ? 'Nom de la catastrophe' : 'Anaran\'ny loza'}</label>
                <input
                  type="text"
                  value={cycloneName}
                  onChange={(e) => setCycloneName(e.target.value)}
                  placeholder={fr ? 'Ex: GAMANE, CHIDO...' : 'Ohatra: GAMANE, CHIDO...'}
                />
              </div>

              {simType === 'eboulement' && (
                <div className="sim-modal-field">
                  <label>{fr ? 'Zone touchée' : 'Faritra tratra'}</label>
                  <select>
                    <option value="ambohimahitsy">Ambohimahitsy</option>
                    <option value="manjakamiadana">Manjakamiadana</option>
                    <option value="andafiavaratra">Andafiavaratra</option>
                    <option value="ambohipotsy">Ambohipotsy</option>
                  </select>
                </div>
              )}

              <div className="sim-modal-actions">
                <button className="sim-modal-cancel" onClick={() => setShowSimModal(false)}>
                  {fr ? 'Annuler' : 'Ajanony'}
                </button>
                <button className="sim-modal-confirm" onClick={() => {
                  setShowSimModal(false)
                  simulateDisaster(cycloneName, simType)
                }}>
                  {fr ? 'Lancer la simulation' : 'Atombohy ny simulation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barre de progression */}
        {simulating && (
          <div className="admin-dash__progress-bar">
            <div className="admin-dash__progress-fill" style={{ width: `${simProgress}%` }} />
          </div>
        )}

        {/* Message de succès */}
        {simDone && (
          <div className="admin-dash__sim-success">
            <i className="bi bi-check-circle-fill" />
            <div>
              <strong>{fr ? '✅ Simulation activée !' : '✅ Simulation voavelona !'}</strong>
              <span>{fr
                ? 'Alerte critique créée, routes bloquées, refuges saturés, zone dangereuse ajoutée. Tous les citoyens ont été alertés !'
                : 'Fampitandremana goavana noforonina, lalana voasakana, toerana feno, faritra mampidi-doza nampiana. Nampandrenesina ny olona rehetra !'}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="admin-dash__loading">
            <div className="spinner-lg" />
            <span>{fr ? 'Chargement...' : 'Miandry...'}</span>
          </div>
        ) : (
          <div className="admin-dash__stats">
            {statCards.map((s, i) => (
              <div key={i} className="admin-dash__stat" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="admin-dash__stat-icon" style={{ background: `${s.color}12`, borderColor: `${s.color}30` }}>
                  <i className={s.icon} style={{ color: s.color }} />
                </div>
                <span className="admin-dash__stat-val" style={{ color: s.color }}>{s.val}</span>
                <span className="admin-dash__stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions rapides */}
        <h2 className="admin-dash__section-title">
          <i className="bi bi-lightning-charge" />
          {fr ? 'Actions rapides' : 'Hetsika haingana'}
        </h2>
        <div className="admin-dash__actions">
          {quickActions.map((a, i) => (
            <button key={i} className="admin-dash__action" onClick={() => navigate(a.path)}>
              <div className="admin-dash__action-icon" style={{ background: `${a.color}12`, borderColor: `${a.color}30` }}>
                <i className={a.icon} style={{ color: a.color }} />
              </div>
              <span>{a.label}</span>
              <i className="bi bi-chevron-right" />
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}