import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './AgentSettings.css'

export default function AgentSettings() {
  const { user } = useAuthStore()
  const { theme, toggleTheme, setAccent, saveUserTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    shelter_id: 1,
    notification_email: true,
    notification_push: true,
    notification_sound: true
  })
  const [notifications, setNotifications] = useState({
    critiques: true,
    meteo: true,
    refuges: true,
    routes: true,
    push: true,
    son: true
  })
  const [saved, setSaved] = useState(false)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  const saveProfile = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const changeTheme = (t) => {
    if (t !== theme) toggleTheme()
  }

  const changeAccent = (a) => {
    setAccent(a)
    if (user?.id) saveUserTheme(user.id)
  }

  const shelters = [
    { id: 1, name: 'Stade Mahamasina' },
    { id: 2, name: 'Lycée JJ Rabearivelo' },
    { id: 3, name: 'Palais des Sports' },
    { id: 4, name: 'Centre Anosizato' },
    { id: 5, name: 'Campus Ankatso' }
  ]

  const tabs = [
    { id: 'profile', icon: 'bi-person', label: fr ? 'Profil' : 'Profil' },
    { id: 'appearance', icon: 'bi-palette', label: fr ? 'Apparence' : 'Endrika' },
    { id: 'notifications', icon: 'bi-bell', label: fr ? 'Notifications' : 'Fampandrenesana' },
    { id: 'shelter', icon: 'bi-building', label: fr ? 'Refuge' : 'Toerana' }
  ]

  return (
    <div className="agent-settings">
      <Navbar />
      <main className="agent-settings__main">
        <h1 className="agent-settings__title">
          <i className="bi bi-gear" />
          {fr ? 'Paramètres Agent' : 'Fitamboatra Agent'}
        </h1>

        <div className="agent-settings__layout">
          {/* Onglets */}
          <div className="agent-settings__tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`agent-settings__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="agent-settings__content">

            {/* ── PROFIL ── */}
            {activeTab === 'profile' && (
              <div className="agent-settings__section">
                <h2><i className="bi bi-person" /> {fr ? 'Informations personnelles' : 'Mombamomba manokana'}</h2>

                <div className="agent-settings__avatar-section">
                  <div className="agent-settings__avatar">{user?.name?.charAt(0) || 'A'}</div>
                  <div>
                    <strong>{user?.name}</strong>
                    <span className="agent-settings__role">Agent</span>
                  </div>
                </div>

                <div className="agent-settings__field">
                  <label>{fr ? 'Nom complet' : 'Anarana feno'}</label>
                  <div className="agent-settings__input-wrap">
                    <i className="bi bi-person" />
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      placeholder="Jean Rakoto"
                    />
                  </div>
                </div>

                <div className="agent-settings__field">
                  <label>Email</label>
                  <div className="agent-settings__input-wrap">
                    <i className="bi bi-envelope" />
                    <input value={profile.email} disabled className="agent-settings__disabled" />
                  </div>
                </div>

                <div className="agent-settings__field">
                  <label>{fr ? 'Téléphone' : 'Finday'}</label>
                  <div className="agent-settings__input-wrap">
                    <i className="bi bi-telephone" />
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                </div>

                {saved && (
                  <div className="agent-settings__success">
                    <i className="bi bi-check-circle" />
                    {fr ? 'Profil sauvegardé !' : 'Profil voatahiry !'}
                  </div>
                )}

                <button className="agent-settings__save" onClick={saveProfile}>
                  <i className="bi bi-check-lg" /> {fr ? 'Sauvegarder' : 'Tahirizo'}
                </button>
              </div>
            )}

            {/* ── APPARTION ── */}
            {activeTab === 'appearance' && (
              <div className="agent-settings__section">
                <h2><i className="bi bi-palette" /> {fr ? 'Apparence' : 'Endrika'}</h2>

                <h3>{fr ? 'Thème' : 'Loko'}</h3>
                <div className="agent-settings__options">
                  <button className={`agent-settings__option ${theme === 'dark' ? 'active' : ''}`} onClick={() => changeTheme('dark')}>
                    <i className="bi bi-moon-stars" />
                    <span>{fr ? 'Sombre' : 'Maizina'}</span>
                  </button>
                  <button className={`agent-settings__option ${theme === 'light' ? 'active' : ''}`} onClick={() => changeTheme('light')}>
                    <i className="bi bi-sun" />
                    <span>{fr ? 'Clair' : 'Mazava'}</span>
                  </button>
                </div>

                <h3>{fr ? 'Couleur d\'accent' : 'Lokon\'ny accent'}</h3>
                <div className="agent-settings__accent-grid">
                  {[
                    { key: 'purple', color: '#a855f7', label: fr ? 'Violet' : 'Voleta' },
                    { key: 'blue', color: '#38bdf8', label: 'Cyan' },
                    { key: 'green', color: '#39ff88', label: fr ? 'Vert' : 'Maitso' },
                    { key: 'red', color: '#ff3b30', label: fr ? 'Rouge' : 'Mena' },
                    { key: 'gold', color: '#facc15', label: fr ? 'Or' : 'Volamena' }
                  ].map(a => (
                    <button key={a.key} className="agent-settings__accent-btn" onClick={() => changeAccent(a.key)}>
                      <span className="agent-settings__accent-dot" style={{ background: a.color }} />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div className="agent-settings__section">
                <h2><i className="bi bi-bell" /> {fr ? 'Notifications' : 'Fampandrenesana'}</h2>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }} />
                    <span>{fr ? 'Alertes critiques' : 'Fampitandremana goavana'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.critiques} onChange={() => setNotifications({...notifications, critiques: !notifications.critiques})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-cloud-lightning-rain" style={{ color: '#38bdf8' }} />
                    <span>{fr ? 'Alertes météo' : 'Fampitandremana toetr\'andro'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.meteo} onChange={() => setNotifications({...notifications, meteo: !notifications.meteo})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-building" style={{ color: '#ff9500' }} />
                    <span>{fr ? 'Alertes refuges' : 'Fampitandremana toerana'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.refuges} onChange={() => setNotifications({...notifications, refuges: !notifications.refuges})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-signpost-split" style={{ color: '#ffd60a' }} />
                    <span>{fr ? 'Alertes routes' : 'Fampitandremana lalana'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.routes} onChange={() => setNotifications({...notifications, routes: !notifications.routes})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-app-indicator" style={{ color: 'var(--accent)' }} />
                    <span>{fr ? 'Notifications push' : 'Notifications push'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.push} onChange={() => setNotifications({...notifications, push: !notifications.push})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>

                <div className="agent-settings__toggle-row">
                  <div className="agent-settings__toggle-info">
                    <i className="bi bi-volume-up" style={{ color: 'var(--accent)' }} />
                    <span>{fr ? 'Son d\'alerte' : 'Feo fampitandremana'}</span>
                  </div>
                  <label className="agent-settings__switch">
                    <input type="checkbox" checked={notifications.son} onChange={() => setNotifications({...notifications, son: !notifications.son})} />
                    <span className="agent-settings__slider" />
                  </label>
                </div>
              </div>
            )}

            {/* ── REFUGE ASSIGNÉ ── */}
            {activeTab === 'shelter' && (
              <div className="agent-settings__section">
                <h2><i className="bi bi-building" /> {fr ? 'Refuge assigné' : 'Toerana notendrena'}</h2>
                <p className="agent-settings__desc">
                  {fr
                    ? 'Vous êtes responsable de ce refuge. Vous pouvez modifier ses informations ici.'
                    : 'Ianao no tompon\'andraikitra amin\'ity toerana ity. Azonao ovaina ny fampahalalana eto.'}
                </p>

                <div className="agent-settings__field">
                  <label>{fr ? 'Refuge' : 'Toerana'}</label>
                  <select className="agent-settings__select" value={profile.shelter_id} onChange={(e) => setProfile({...profile, shelter_id: parseInt(e.target.value)})}>
                    {shelters.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="agent-settings__info-card">
                  <i className="bi bi-info-circle" />
                  <div>
                    <strong>{fr ? 'Information' : 'Fampahalalana'}</strong>
                    <p>{fr ? 'Changer de refuge nécessite l\'approbation de l\'administrateur.' : 'Ny fanovana toerana dia mila fankatoavan\'ny admin.'}</p>
                  </div>
                </div>

                <button className="agent-settings__save" onClick={saveProfile}>
                  <i className="bi bi-check-lg" /> {fr ? 'Appliquer' : 'Ampiharo'}
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}