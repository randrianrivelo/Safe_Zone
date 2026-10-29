import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import './UserSettings.css'

export default function UserSettings() {
  const { user } = useAuthStore()
  const {
    theme: storeTheme,
    accent: storeAccent,
    glow: storeGlow,
    toggleTheme,
    setAccent,
    setGlow,
    saveUserTheme
  } = useThemeStore()

  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'
  const [activeTab, setActiveTab] = useState('profil')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', storeTheme)
    document.documentElement.setAttribute('data-accent', storeAccent)
  }, [storeTheme, storeAccent])

  const [theme, setTheme] = useState(storeTheme)
  const [accentColor, setAccentColor] = useState(storeAccent)
  const [glowIntensity, setGlowIntensity] = useState(storeGlow)
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr')

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: '',
    blood: '',
    allergies: '',
    contact1: '',
    contact2: '',
    contact3: ''
  })
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const [notifs, setNotifs] = useState({
    critiques: true,
    meteo: true,
    refuges: true,
    routes: true,
    push: false,
    son: true
  })

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })

  const [positionSettings, setPositionSettings] = useState({
    gps: true,
    partager: false,
    tempsReel: false,
    eco: true
  })

  const [animations, setAnimations] = useState(
    localStorage.getItem('sz_animations') !== 'off'
  )

  useEffect(() => {
    setTheme(storeTheme)
    setAccentColor(storeAccent)
    setGlowIntensity(storeGlow)
  }, [storeTheme, storeAccent, storeGlow])

  const changeTheme = (t) => {
    if (t !== storeTheme) toggleTheme()
    setTheme(t)
    if (user?.id) {
      saveUserTheme(user.id)
    }
  }

  const changeLang = (l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  const changeAccent = (a) => {
    setAccentColor(a)
    setAccent(a)
    if (user?.id) {
      saveUserTheme(user.id)
    }
  }

  const changeGlow = (g) => {
    setGlowIntensity(g)
    setGlow(g)
    if (user?.id) {
      saveUserTheme(user.id)
    }
  }

  const changeAnimations = () => {
    const next = !animations
    setAnimations(next)
    document.documentElement.setAttribute('data-animations', next ? 'on' : 'off')
    localStorage.setItem('sz_animations', next ? 'on' : 'off')
  }

  const changeTextSize = (s) => {
    const sizes = { small: '14px', normal: '16px', large: '18px' }
    localStorage.setItem('sz_textSize', s)
    setTimeout(() => {
      document.documentElement.style.fontSize = sizes[s]
    }, 0)
  }

  const changeFontFamily = (f) => {
    const fonts = {
      default: "'Inter', 'Segoe UI', system-ui, sans-serif",
      dyslexic: "'Comic Sans MS', cursive, sans-serif"
    }
    localStorage.setItem('sz_font', f)
    setTimeout(() => {
      document.body.style.fontFamily = fonts[f]
    }, 0)
  }

  const saveProfile = async () => {
    setProfileLoading(true)
    try {
      let token = localStorage.getItem('token')
      if (token && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1)
      }
      if (!token) return
      await fetch('http://localhost:8000/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profile.name, phone: profile.phone })
      })
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch {
      console.error('Erreur sauvegarde profil')
    } finally {
      setProfileLoading(false)
    }
  }

  const tabs = [
    { id: 'profil', icon: 'bi-person', label: fr ? 'Profil' : 'Profil' },
    { id: 'apparence', icon: 'bi-palette', label: fr ? 'Apparence' : 'Endrika' },
    { id: 'notifs', icon: 'bi-bell', label: fr ? 'Notifications' : 'Fampandrenesana' },
    { id: 'securite', icon: 'bi-shield-lock', label: fr ? 'Sécurité' : 'Fiarovana' },
    { id: 'position', icon: 'bi-geo-alt', label: fr ? 'Position' : 'Toerana' },
    { id: 'about', icon: 'bi-info-circle', label: fr ? 'À propos' : 'Mombamomba' }
  ]

  return (
    <div className="settings">
      <Navbar />
      <main className="settings__main">
        <h1 className="settings__title">
          <i className="bi bi-gear" />
          {fr ? 'Paramètres' : 'Fitamboatra'}
        </h1>

        <div className="settings__layout">
          <div className="settings__tabs">
            {tabs.map((t) => (
              <button
                key={t.id}
                className={`settings__tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                <i className={t.icon} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className="settings__content">

            {/* PROFIL */}
            {activeTab === 'profil' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-person" /> {fr ? 'Informations personnelles' : 'Mombamomba manokana'}
                </h2>

                <div className="settings__avatar-section">
                  <div className="settings__avatar">{user?.name?.charAt(0) || 'U'}</div>
                  <div>
                    <strong>{user?.name}</strong>
                    <span className="settings__role">{user?.role}</span>
                  </div>
                </div>

                <div className="settings__field">
                  <label>{fr ? 'Nom complet' : 'Anarana feno'}</label>
                  <div className="settings__input-wrap">
                    <i className="bi bi-person" />
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="Jean Rakoto"
                    />
                  </div>
                </div>

                <div className="settings__field">
                  <label>Email</label>
                  <div className="settings__input-wrap">
                    <i className="bi bi-envelope" />
                    <input value={user?.email || ''} disabled className="settings__disabled" />
                  </div>
                </div>

                <div className="settings__field">
                  <label>{fr ? 'Téléphone' : 'Finday'}</label>
                  <div className="settings__input-wrap">
                    <i className="bi bi-telephone" />
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+261 34 00 000 00"
                    />
                  </div>
                </div>

                <div className="settings__row">
                  <div className="settings__field">
                    <label>{fr ? 'Groupe sanguin' : 'Vondrona ra'}</label>
                    <select
                      className="settings__select"
                      value={profile.blood}
                      onChange={(e) => setProfile({ ...profile, blood: e.target.value })}
                    >
                      <option value="">—</option>
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div className="settings__field">
                    <label>{fr ? 'Allergies' : 'Arezy'}</label>
                    <div className="settings__input-wrap">
                      <i className="bi bi-bandaid" />
                      <input
                        value={profile.allergies}
                        onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                        placeholder={fr ? 'Aucune' : 'Tsy misy'}
                      />
                    </div>
                  </div>
                </div>

                <h3 style={{ marginTop: 20, marginBottom: 12 }}>
                  <i className="bi bi-people" /> {fr ? "Contacts d'urgence" : 'Mifandray maika'}
                </h3>
                {[1, 2, 3].map((n) => (
                  <div key={n} className="settings__field">
                    <label>Contact {n}</label>
                    <div className="settings__input-wrap">
                      <i className="bi bi-person-lines-fill" />
                      <input
                        value={profile[`contact${n}`] || ''}
                        onChange={(e) => setProfile({ ...profile, [`contact${n}`]: e.target.value })}
                        placeholder={fr ? 'Nom + numéro' : 'Anarana + laharana'}
                      />
                    </div>
                  </div>
                ))}

                {profileSaved && (
                  <div className="settings__success">
                    <i className="bi bi-check-circle" />
                    {fr ? 'Profil sauvegardé !' : 'Profil voatahiry !'}
                  </div>
                )}

                <div className="settings__actions">
                  <button className="settings__save" onClick={saveProfile} disabled={profileLoading}>
                    {profileLoading ? (
                      <>
                        <div className="spinner-sm" /> {fr ? 'Sauvegarde...' : 'Mitahiry...'}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg" /> {fr ? 'Enregistrer' : 'Tahirizo'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* APPARENCE */}
            {activeTab === 'apparence' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-palette" /> {fr ? 'Apparence' : 'Endrika'}
                </h2>

                <h3>{fr ? 'Thème' : 'Loko'}</h3>
                <div className="settings__options">
                  <button
                    className={`settings__option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => changeTheme('dark')}
                  >
                    <i className="bi bi-moon-stars" />
                    <span>{fr ? 'Sombre' : 'Maizina'}</span>
                  </button>
                  <button
                    className={`settings__option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => changeTheme('light')}
                  >
                    <i className="bi bi-sun" />
                    <span>{fr ? 'Clair' : 'Mazava'}</span>
                  </button>
                </div>

                <h3>{fr ? 'Langue' : 'Fiteny'}</h3>
                <div className="settings__options">
                  <button
                    className={`settings__option ${lang === 'fr' ? 'active' : ''}`}
                    onClick={() => changeLang('fr')}
                  >
                    <span>🇫🇷</span>
                    <span>Français</span>
                  </button>
                  <button
                    className={`settings__option ${lang === 'mg' ? 'active' : ''}`}
                    onClick={() => changeLang('mg')}
                  >
                    <span>🇲🇬</span>
                    <span>Malagasy</span>
                  </button>
                </div>

                <h3>{fr ? "Couleur d'accent" : 'Lokon\'ny accent'}</h3>
                <div className="settings__accent-grid">
                  {[
                    { key: 'purple', color: '#a855f7', label: fr ? 'Violet' : 'Voleta' },
                    { key: 'blue', color: '#38bdf8', label: 'Cyan' },
                    { key: 'green', color: '#39ff88', label: fr ? 'Vert' : 'Maitso' },
                    { key: 'red', color: '#ff3b30', label: fr ? 'Rouge' : 'Mena' },
                    { key: 'gold', color: '#facc15', label: fr ? 'Or' : 'Volamena' }
                  ].map((a) => (
                    <button
                      key={a.key}
                      className={`settings__accent-btn ${accentColor === a.key ? 'active' : ''}`}
                      onClick={() => changeAccent(a.key)}
                    >
                      <span className="settings__accent-dot" style={{ background: a.color }} />
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>

                <h3>{fr ? "Intensité du glow" : "Haben'ny glow"}</h3>
                <div className="settings__options">
                  {[
                    { val: 'low', icon: 'bi-brightness-low', label: fr ? 'Faible' : 'Malemy' },
                    { val: 'medium', icon: 'bi-brightness-high', label: fr ? 'Moyen' : 'Antonony' },
                    { val: 'high', icon: 'bi-stars', label: fr ? 'Fort' : 'Mahery' }
                  ].map((g) => (
                    <button
                      key={g.val}
                      className={`settings__option ${glowIntensity === g.val ? 'active' : ''}`}
                      onClick={() => changeGlow(g.val)}
                    >
                      <i className={g.icon} />
                      <span>{g.label}</span>
                    </button>
                  ))}
                </div>

                <h3>{fr ? 'Taille du texte' : 'Haben-tsoratra'}</h3>
                <div className="settings__options">
                  {[
                    { val: 'small', label: fr ? 'Petit' : 'Kely', preview: '0.78rem' },
                    { val: 'normal', label: 'Normal', preview: '0.9rem' },
                    { val: 'large', label: fr ? 'Grand' : 'Lehibe', preview: '1.05rem' }
                  ].map((s) => (
                    <button key={s.val} className="settings__option" onClick={() => changeTextSize(s.val)}>
                      <span style={{ fontSize: s.preview, fontWeight: 700 }}>Aa</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                <h3>{fr ? 'Police' : 'Soratra'}</h3>
                <div className="settings__options">
                  {[
                    { val: 'default', label: fr ? 'Par défaut' : 'Mahazatra', font: "'Inter', sans-serif" },
                    { val: 'dyslexic', label: 'OpenDyslexic', font: "'Comic Sans MS', sans-serif" }
                  ].map((f) => (
                    <button key={f.val} className="settings__option" onClick={() => changeFontFamily(f.val)}>
                      <span style={{ fontFamily: f.font, fontSize: '1rem' }}>Aa</span>
                      <span>{f.label}</span>
                    </button>
                  ))}
                </div>

                <div className="settings__toggle-row" style={{ marginTop: 16 }}>
                  <div className="settings__toggle-info">
                    <i className="bi bi-stars" style={{ color: 'var(--accent)' }} />
                    <span>{fr ? 'Animations activées' : 'Animations velona'}</span>
                  </div>
                  <label className="settings__switch">
                    <input type="checkbox" checked={animations} onChange={changeAnimations} />
                    <span className="settings__slider" />
                  </label>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifs' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-bell" /> {fr ? 'Notifications' : 'Fampandrenesana'}
                </h2>
                {[
                  { key: 'critiques', icon: 'bi-exclamation-triangle-fill', label: fr ? 'Alertes critiques' : 'Fampitandremana goavana', color: '#ff3b30' },
                  { key: 'meteo', icon: 'bi-cloud-lightning-rain', label: fr ? 'Alertes météo' : "Fampitandremana toetr'andro", color: '#38bdf8' },
                  { key: 'refuges', icon: 'bi-building', label: fr ? 'Alertes refuges' : 'Fampitandremana toerana', color: '#ff9500' },
                  { key: 'routes', icon: 'bi-signpost-split', label: fr ? 'Alertes routes' : 'Fampitandremana lalana', color: '#ffd60a' },
                  { key: 'push', icon: 'bi-app-indicator', label: fr ? 'Notifications push' : 'Notifications push', color: 'var(--accent)' },
                  { key: 'son', icon: 'bi-volume-up', label: fr ? "Son d'alerte" : 'Feo fampitandremana', color: 'var(--accent)' }
                ].map((n) => (
                  <div key={n.key} className="settings__toggle-row">
                    <div className="settings__toggle-info">
                      <i className={n.icon} style={{ color: n.color }} />
                      <span>{n.label}</span>
                    </div>
                    <label className="settings__switch">
                      <input
                        type="checkbox"
                        checked={notifs[n.key]}
                        onChange={() => setNotifs({ ...notifs, [n.key]: !notifs[n.key] })}
                      />
                      <span className="settings__slider" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* SÉCURITÉ - SANS CODE URGENCE */}
            {activeTab === 'securite' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-shield-lock" /> {fr ? 'Sécurité' : 'Fiarovana'}
                </h2>
                <h3>{fr ? 'Changer le mot de passe' : 'Ovay ny teny miafina'}</h3>
                {['current', 'newPass', 'confirm'].map((k, i) => (
                  <div key={k} className="settings__field">
                    <label>
                      {[
                        fr ? 'Mot de passe actuel' : 'Teny miafina ankehitriny',
                        fr ? 'Nouveau mot de passe' : 'Teny miafina vaovao',
                        fr ? 'Confirmation' : 'Fanamafisana'
                      ][i]}
                    </label>
                    <div className="settings__input-wrap">
                      <i className={i === 0 ? 'bi bi-lock' : 'bi bi-lock-fill'} />
                      <input
                        type="password"
                        value={passwords[k]}
                        onChange={(e) => setPasswords({ ...passwords, [k]: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                ))}
                <button
                  className="settings__save"
                  onClick={() => alert(fr ? 'Fonctionnalité à venir en V2' : "Ho avy amin'ny V2")}
                >
                  <i className="bi bi-check-lg" />
                  {fr ? 'Changer le mot de passe' : 'Ovay ny teny miafina'}
                </button>
              </div>
            )}

            {/* POSITION */}
            {activeTab === 'position' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-geo-alt" /> {fr ? 'Position GPS' : 'Toerana GPS'}
                </h2>
                {[
                  { key: 'gps', label: fr ? 'Autoriser la géolocalisation' : 'Manaiky ny GPS' },
                  { key: 'partager', label: fr ? 'Partager ma position avec les secours' : 'Mizara ny toerako' },
                  { key: 'tempsReel', label: fr ? 'Position en temps réel (plus de batterie)' : 'Toerana amin\'ny fotoana tena izy' },
                  { key: 'eco', label: fr ? 'Mode économique' : 'Fomba tsotra' }
                ].map((p) => (
                  <div key={p.key} className="settings__toggle-row">
                    <span>{p.label}</span>
                    <label className="settings__switch">
                      <input
                        type="checkbox"
                        checked={positionSettings[p.key]}
                        onChange={() =>
                          setPositionSettings({
                            ...positionSettings,
                            [p.key]: !positionSettings[p.key]
                          })
                        }
                      />
                      <span className="settings__slider" />
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* À PROPOS */}
            {activeTab === 'about' && (
              <div className="settings__section">
                <h2>
                  <i className="bi bi-info-circle" /> {fr ? 'À propos' : 'Mombamomba'}
                </h2>
                <div className="settings__about-grid">
                  {[
                    { label: fr ? 'Version' : 'Dikan-teny', val: 'SafeZone v1.0.0' },
                    { label: fr ? 'Dernière mise à jour' : 'Fanavaozana farany', val: 'Mai 2026' },
                    { label: fr ? 'Développé par' : "Nataon'ny", val: 'ESMIA Innovation' },
                    { label: fr ? 'Région couverte' : 'Faritra voasarona', val: 'Analamanga (10 districts)' },
                    { label: fr ? 'Refuges' : 'Toerana fiarovana', val: '97 refuges' },
                    { label: fr ? 'Algorithmes' : 'Algoritma', val: 'Dijkstra + A* + Prog. Dynamique' }
                  ].map((item, i) => (
                    <div key={i} className="settings__about-item">
                      <span>{item.label}</span>
                      <strong>{item.val}</strong>
                    </div>
                  ))}
                </div>
                <div className="settings__about-links">
                  {[
                    { icon: 'bi-file-text', label: fr ? 'Mentions légales' : 'Fepetra ara-dalana', path: '/about' },
                    { icon: 'bi-question-circle', label: 'FAQ', path: '/faq' },
                    { icon: 'bi-book', label: fr ? 'Guide' : 'Torolalana', path: '/guide' }
                  ].map((l, i) => (
                    <button key={i} onClick={() => window.location.href = l.path}>
                      <i className={l.icon} /> {l.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}