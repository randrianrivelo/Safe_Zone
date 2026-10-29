import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'  // ← AJOUTER "from"
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'

export default function AdminSettings() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { theme, toggleTheme, setAccent } = useThemeStore()
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: '' })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [notifications, setNotifications] = useState({
    critiques: true,
    alerts: true,
    reports: true,
    email: true
  })
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
  }

  const tabs = [
    { id: 'profile', icon: 'bi-person', label: fr ? 'Profil' : 'Profil' },
    { id: 'appearance', icon: 'bi-palette', label: fr ? 'Apparence' : 'Endrika' },
    { id: 'notifications', icon: 'bi-bell', label: fr ? 'Notifications' : 'Fampandrenesana' },
    { id: 'security', icon: 'bi-shield-lock', label: fr ? 'Sécurité' : 'Fiarovana' }
  ]

  return (
    <div className="admin-settings">
      <Navbar />
      <main className="admin-settings__main">
        <div className="admin-settings__header">
          <h1><i className="bi bi-gear-wide-connected" /> {fr ? 'Paramètres administration' : 'Fitamboatra mpitantana'}</h1>
          <p className="admin-settings__desc">{fr ? 'Gérez la configuration de la plateforme SafeZone' : 'Tantano ny fandrindrana ny sehatra SafeZone'}</p>
        </div>

        <div className="admin-settings__layout">
          {/* Onglets */}
          <div className="admin-settings__tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-settings__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <i className={tab.icon} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div className="admin-settings__content">

            {/* PROFIL */}
            {activeTab === 'profile' && (
              <div className="admin-settings__card">
                <h2><i className="bi bi-person-circle" /> {fr ? 'Informations administrateur' : 'Mombamomba ny mpitantana'}</h2>

                <div className="admin-settings__avatar-section">
                  <div className="admin-settings__avatar">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <strong>{user?.name || 'Admin'}</strong>
                    <span className="admin-settings__role">{user?.role || 'admin'}</span>
                  </div>
                </div>

                <div className="admin-settings__form">
                  <div className="admin-settings__field">
                    <label>{fr ? 'Nom complet' : 'Anarana feno'}</label>
                    <div className="admin-settings__input-wrap">
                      <i className="bi bi-person" />
                      <input
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Jean Rakoto"
                      />
                    </div>
                  </div>

                  <div className="admin-settings__field">
                    <label>Email</label>
                    <div className="admin-settings__input-wrap">
                      <i className="bi bi-envelope" />
                      <input value={profile.email} disabled className="admin-settings__disabled" />
                    </div>
                  </div>

                  <div className="admin-settings__field">
                    <label>{fr ? 'Téléphone' : 'Finday'}</label>
                    <div className="admin-settings__input-wrap">
                      <i className="bi bi-telephone" />
                      <input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+261 34 00 000 00"
                      />
                    </div>
                  </div>

                  {saved && (
                    <div className="admin-settings__success">
                      <i className="bi bi-check-circle-fill" />
                      {fr ? 'Profil sauvegardé !' : 'Profil voatahiry !'}
                    </div>
                  )}

                  <button className="admin-settings__btn admin-settings__btn-primary" onClick={saveProfile}>
                    <i className="bi bi-check-lg" /> {fr ? 'Sauvegarder' : 'Tahirizo'}
                  </button>
                </div>
              </div>
            )}

            {/* APPARENCE */}
            {activeTab === 'appearance' && (
              <div className="admin-settings__card">
                <h2><i className="bi bi-palette" /> {fr ? 'Thème et apparence' : 'Loko sy endrika'}</h2>

                <div className="admin-settings__section">
                  <h3>{fr ? 'Thème' : 'Loko'}</h3>
                  <div className="admin-settings__options">
                    <button
                      className={`admin-settings__option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => changeTheme('dark')}
                    >
                      <i className="bi bi-moon-stars" />
                      <span>{fr ? 'Sombre' : 'Maizina'}</span>
                    </button>
                    <button
                      className={`admin-settings__option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => changeTheme('light')}
                    >
                      <i className="bi bi-sun" />
                      <span>{fr ? 'Clair' : 'Mazava'}</span>
                    </button>
                  </div>
                </div>

                <div className="admin-settings__section">
                  <h3>{fr ? 'Couleur d\'accent' : 'Lokon\'ny accent'}</h3>
                  <div className="admin-settings__accent-grid">
                    {[
                      { key: 'purple', color: '#a855f7', label: fr ? 'Violet' : 'Voleta' },
                      { key: 'blue', color: '#38bdf8', label: 'Cyan' },
                      { key: 'green', color: '#39ff88', label: fr ? 'Vert' : 'Maitso' },
                      { key: 'red', color: '#ff3b30', label: fr ? 'Rouge' : 'Mena' },
                      { key: 'gold', color: '#facc15', label: fr ? 'Or' : 'Volamena' }
                    ].map(a => (
                      <button
                        key={a.key}
                        className={`admin-settings__accent-btn ${localStorage.getItem('sz_accent') === a.key ? 'active' : ''}`}
                        onClick={() => changeAccent(a.key)}
                      >
                        <span className="admin-settings__accent-dot" style={{ background: a.color }} />
                        <span>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="admin-settings__card">
                <h2><i className="bi bi-bell" /> {fr ? 'Notifications administrateur' : 'Fampandrenesana mpitantana'}</h2>

                <div className="admin-settings__toggle-row">
                  <div className="admin-settings__toggle-info">
                    <i className="bi bi-exclamation-triangle-fill" style={{ color: '#ff3b30' }} />
                    <span>{fr ? 'Alertes critiques' : 'Fampitandremana goavana'}</span>
                  </div>
                  <label className="admin-settings__switch">
                    <input type="checkbox" checked={notifications.critiques} onChange={() => setNotifications({...notifications, critiques: !notifications.critiques})} />
                    <span className="admin-settings__slider" />
                  </label>
                </div>

                <div className="admin-settings__toggle-row">
                  <div className="admin-settings__toggle-info">
                    <i className="bi bi-megaphone-fill" style={{ color: '#a855f7' }} />
                    <span>{fr ? 'Alertes système' : 'Fampitandremana rafitra'}</span>
                  </div>
                  <label className="admin-settings__switch">
                    <input type="checkbox" checked={notifications.alerts} onChange={() => setNotifications({...notifications, alerts: !notifications.alerts})} />
                    <span className="admin-settings__slider" />
                  </label>
                </div>

                <div className="admin-settings__toggle-row">
                  <div className="admin-settings__toggle-info">
                    <i className="bi bi-flag" style={{ color: '#ff9500' }} />
                    <span>{fr ? 'Nouveaux signalements' : 'Fampandrenesana vaovao'}</span>
                  </div>
                  <label className="admin-settings__switch">
                    <input type="checkbox" checked={notifications.reports} onChange={() => setNotifications({...notifications, reports: !notifications.reports})} />
                    <span className="admin-settings__slider" />
                  </label>
                </div>

                <div className="admin-settings__toggle-row">
                  <div className="admin-settings__toggle-info">
                    <i className="bi bi-envelope" style={{ color: '#38bdf8' }} />
                    <span>{fr ? 'Notifications email' : 'Fampandrenesana mailaka'}</span>
                  </div>
                  <label className="admin-settings__switch">
                    <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({...notifications, email: !notifications.email})} />
                    <span className="admin-settings__slider" />
                  </label>
                </div>

                <button className="admin-settings__btn admin-settings__btn-secondary">
                  <i className="bi bi-save" /> {fr ? 'Sauvegarder les préférences' : 'Tahirizo ny safidy'}
                </button>
              </div>
            )}

            {/* SÉCURITÉ */}
            {activeTab === 'security' && (
              <div className="admin-settings__card">
                <h2><i className="bi bi-shield-lock" /> {fr ? 'Sécurité' : 'Fiarovana'}</h2>

                <div className="admin-settings__info-box">
                  <i className="bi bi-info-circle-fill" />
                  <div>
                    <strong>{fr ? 'Code urgence' : 'Kaody maika'}</strong>
                    <p>{fr ? 'Gérez le code d\'accès au mode urgence de l\'application' : 'Tantano ny kaody fidirana amin\'ny fomba maika amin\'ny fampiharana'}</p>
                  </div>
                  <button className="admin-settings__btn-sm" onClick={() => navigate('/admin/emergency')}>
                    {fr ? 'Configurer' : 'Havaozy'} <i className="bi bi-arrow-right" />
                  </button>
                </div>

                <div className="admin-settings__info-box">
                  <i className="bi bi-database" />
                  <div>
                    <strong>{fr ? 'Journal d\'audit' : 'Tantaran\'ny hetsika'}</strong>
                    <p>{fr ? 'Consultez l\'historique des connexions et actions administrateur' : 'Jereo ny tantaran\'ny fidirana sy hetsika mpitantana'}</p>
                  </div>
                  <button className="admin-settings__btn-sm" onClick={() => navigate('/admin/logs')}>
                    {fr ? 'Voir' : 'Hijery'} <i className="bi bi-arrow-right" />
                  </button>
                </div>

                <div className="admin-settings__info-box admin-settings__info-box--danger">
                  <i className="bi bi-exclamation-triangle-fill" />
                  <div>
                    <strong>{fr ? 'Zone critique' : 'Faritra mampidi-doza'}</strong>
                    <p>{fr ? 'Actions irréversibles - manipulation avancée' : 'Hetsika tsy azo averina - fanovana mandroso'}</p>
                  </div>
                  <button className="admin-settings__btn-sm admin-settings__btn-danger" onClick={() => alert('Fonctionnalité réservée')}>
                    <i className="bi bi-shield-exclamation" /> {fr ? 'Accès restreint' : 'Fidirana voafetra'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="admin-settings__actions">
          <button className="admin-settings__btn-outline" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left" /> {fr ? 'Retour au dashboard' : 'Hiverina'}
          </button>
          <button className="admin-settings__btn-primary" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise" /> {fr ? 'Rafraîchir' : 'Havaozina'}
          </button>
        </div>
      </main>

      <style jsx>{`
        .admin-settings {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .admin-settings__main {
          padding: 80px 32px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-settings__header {
          margin-bottom: 32px;
        }

        .admin-settings__header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .admin-settings__desc {
          color: var(--text-secondary);
          font-size: 0.88rem;
        }

        .admin-settings__layout {
          display: flex;
          gap: 24px;
        }

        .admin-settings__tabs {
          width: 240px;
          min-width: 240px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-settings__tab {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .admin-settings__tab:hover {
          background: var(--bg-input);
          color: var(--text-primary);
        }

        .admin-settings__tab.active {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 600;
        }

        .admin-settings__tab i {
          font-size: 1.1rem;
          width: 24px;
        }

        .admin-settings__content {
          flex: 1;
        }

        .admin-settings__card {
          background: var(--glass-bg);
          backdrop-filter: var(--glass-blur);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
        }

        .admin-settings__card h2 {
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .admin-settings__card h3 {
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--text-secondary);
        }

        .admin-settings__avatar-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .admin-settings__avatar {
          width: 56px;
          height: 56px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: #050816;
        }

        .admin-settings__role {
          display: inline-block;
          font-size: 0.7rem;
          color: var(--accent);
          background: var(--accent-light);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-top: 4px;
        }

        .admin-settings__form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .admin-settings__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-settings__field label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .admin-settings__input-wrap {
          position: relative;
        }

        .admin-settings__input-wrap i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .admin-settings__input-wrap input {
          width: 100%;
          padding: 10px 14px 10px 38px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.85rem;
          font-family: inherit;
          outline: none;
        }

        .admin-settings__input-wrap input:focus {
          border-color: var(--accent);
        }

        .admin-settings__disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-settings__success {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: rgba(57, 255, 136, 0.1);
          border: 1px solid rgba(57, 255, 136, 0.2);
          border-radius: var(--radius-sm);
          color: #39ff88;
          font-size: 0.85rem;
        }

        .admin-settings__section {
          margin-bottom: 24px;
        }

        .admin-settings__options {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-settings__option {
          flex: 1;
          min-width: 100px;
          padding: 12px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .admin-settings__option i {
          font-size: 1.3rem;
        }

        .admin-settings__option:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .admin-settings__option.active {
          background: var(--accent-light);
          border-color: var(--accent);
          color: var(--accent);
          font-weight: 600;
        }

        .admin-settings__accent-grid {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .admin-settings__accent-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .admin-settings__accent-btn:hover {
          border-color: var(--accent);
        }

        .admin-settings__accent-btn.active {
          border-color: var(--accent);
          background: var(--accent-light);
          color: var(--accent);
        }

        .admin-settings__accent-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
        }

        .admin-settings__toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }

        .admin-settings__toggle-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-settings__toggle-info i {
          font-size: 1.1rem;
        }

        .admin-settings__switch {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .admin-settings__switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .admin-settings__slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: var(--border);
          border-radius: 24px;
          transition: all 0.2s ease;
        }

        .admin-settings__slider::before {
          content: '';
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: #ffffff;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .admin-settings__switch input:checked + .admin-settings__slider {
          background: var(--accent);
        }

        .admin-settings__switch input:checked + .admin-settings__slider::before {
          transform: translateX(20px);
        }

        .admin-settings__info-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: 12px;
        }

        .admin-settings__info-box i {
          font-size: 1.5rem;
          color: var(--accent);
        }

        .admin-settings__info-box div {
          flex: 1;
        }

        .admin-settings__info-box strong {
          display: block;
          font-size: 0.85rem;
          margin-bottom: 2px;
        }

        .admin-settings__info-box p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .admin-settings__info-box--danger {
          border-left: 3px solid #ff3b30;
        }

        .admin-settings__info-box--danger i {
          color: #ff3b30;
        }

        .admin-settings__btn {
          padding: 10px 20px;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .admin-settings__btn-primary {
          background: var(--accent);
          color: #ffffff;
        }

        .admin-settings__btn-primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .admin-settings__btn-secondary {
          background: var(--bg-input);
          border: 1px solid var(--border);
          color: var(--text-primary);
        }

        .admin-settings__btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .admin-settings__btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }

        .admin-settings__btn-outline:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .admin-settings__btn-sm {
          padding: 6px 14px;
          background: var(--accent-light);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-sm);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .admin-settings__btn-danger {
          background: rgba(255, 59, 48, 0.1);
          border-color: rgba(255, 59, 48, 0.3);
          color: #ff3b30;
        }

        .admin-settings__actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .admin-settings__main {
            padding: 70px 16px 24px;
          }
          .admin-settings__layout {
            flex-direction: column;
          }
          .admin-settings__tabs {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .admin-settings__tab {
            flex: 1;
            justify-content: center;
          }
          .admin-settings__tab span {
            display: none;
          }
          .admin-settings__options {
            flex-direction: column;
          }
          .admin-settings__info-box {
            flex-direction: column;
            text-align: center;
          }
          .admin-settings__actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}