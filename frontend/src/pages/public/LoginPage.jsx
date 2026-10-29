import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuthStore()
  const { theme } = useThemeStore()
  const [isRight, setIsRight] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lang, setLang] = useState('fr')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    useThemeStore.getState().toggleTheme()
  }

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value })
    setError('')
  }
  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value })
    setError('')
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(loginForm.email, loginForm.password)
      if (res.role === 'admin') navigate('/admin')
      else if (res.role === 'agent') navigate('/agent/dashboard')
      else navigate('/dashboard')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Email ou mot de passe incorrect')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(regForm)
      navigate('/dashboard')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Erreur lors de l\'inscription')
    } finally { setLoading(false) }
  }

  // ✅ Bouton urgence - redirection directe
  const handleEmergency = () => {
    navigate('/emergency')
  }

  const txt = {
    fr: {
      loginTitle: 'Bon retour',
      loginSub: 'Connectez-vous pour accéder à SafeZone',
      regTitle: 'Créer un compte',
      regSub: 'Rejoignez SafeZone Analamanga 2035',
      email: 'email@exemple.mg',
      password: '••••••••',
      name: 'Jean Rakoto',
      phone: '+261 34 00 000 00',
      submit: 'Se connecter',
      submitReg: 'Créer mon compte',
      loading: 'Chargement...',
      or: 'ou continuer avec',
      overlayL: 'Déjà membre ?',
      overlayLsub: 'Connectez-vous pour accéder à vos informations et trouver un refuge rapidement.',
      overlayLbtn: 'Connexion',
      overlayR: 'Nouveau ici ?',
      overlayRsub: 'Créez votre compte SafeZone et préparez-vous face aux catastrophes.',
      overlayRbtn: 'Inscription',
      emergency: 'Acceder Mode urgence',
      back: 'Retour'
    },
    mg: {
      loginTitle: 'Tonga soa',
      loginSub: 'Miditra mba hahazo SafeZone',
      regTitle: 'Hamorona kaonty',
      regSub: 'Midira ao SafeZone Analamanga 2035',
      email: 'email@ohatra.mg',
      password: '••••••••',
      name: 'Jean Rakoto',
      phone: '+261 34 00 000 00',
      submit: 'Hiditra',
      submitReg: 'Hamorona kaonty',
      loading: 'Miandry...',
      or: 'na amin\'ny',
      overlayL: 'Efa mpikambana ?',
      overlayLsub: 'Miditra mba hahazo ny fampahalalana sy mitady toerana fiarovana.',
      overlayLbtn: 'Hiditra',
      overlayR: 'Vaovao eto ?',
      overlayRsub: 'Hamorona ny kaontinao SafeZone ary miomana amin\'ny loza voajanahary.',
      overlayRbtn: 'Misoratra',
      emergency: '🔴 Fomba maika',
      back: 'Hiverina'
    }
  }
  const T = txt[lang]

  return (
    <div className="login-page">

      {/* Bouton retour */}
      <button className="back-btn" onClick={() => navigate('/')}>
        <i className="bi bi-arrow-left" /> {T.back}
      </button>

      {/* Toggle thème + langue */}
      <div className="login-top-actions">
        <button className="login-top-btn" onClick={toggleTheme}
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`} />
        </button>
        <button className="login-top-btn"
          onClick={() => setLang(lang === 'fr' ? 'mg' : 'fr')}>
          {lang === 'fr' ? '🇲🇬' : '🇫🇷'}
        </button>
      </div>

      {/* CONTAINER PRINCIPAL */}
      <div className={`login-container ${isRight ? 'right-panel-active' : ''}`}>

        {/* FORMULAIRE CONNEXION */}
        <div className="form-container sign-in-container">
          <h2 className="form-title">{T.loginTitle}</h2>
          <p className="form-subtitle">{T.loginSub}</p>

          <div className="social-container">
            {['bi-google', 'bi-facebook', 'bi-github'].map((icon, i) => (
              <button key={i} className="social-btn"
                onClick={() => alert('Fonctionnalité à venir')}>
                <i className={icon} />
              </button>
            ))}
          </div>

          <div className="or-divider"><span>{T.or}</span></div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <i className="bi bi-envelope" />
              <input className="form-input" type="email" name="email"
                value={loginForm.email} onChange={handleLoginChange}
                placeholder={T.email} required />
            </div>
            <div className="input-group">
              <i className="bi bi-lock" />
              <input className="form-input"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                placeholder={T.password} required />
              <button type="button" className="input-eye"
                onClick={() => setShowPass(!showPass)}>
                <i className={`bi bi-${showPass ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>

            {error && !isRight && (
              <div className="form-error">
                <i className="bi bi-exclamation-triangle-fill" /> {error}
              </div>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><div className="spinner-sm" />{T.loading}</>
                : <><i className="bi bi-box-arrow-in-right" />{T.submit}</>
              }
            </button>
          </form>

          {/* ✅ BOUTON URGENCE DANS LE FORMULAIRE CONNEXION */}
          <button className="emergency-link" onClick={handleEmergency}>
            <i className="bi bi-lightning-charge-fill" />
            {T.emergency}
          </button>
        </div>

        {/* FORMULAIRE INSCRIPTION */}
        <div className="form-container sign-up-container">
          <h2 className="form-title">{T.regTitle}</h2>
          <p className="form-subtitle">{T.regSub}</p>

          <div className="social-container">
            {['bi-google', 'bi-facebook', 'bi-github'].map((icon, i) => (
              <button key={i} className="social-btn"
                onClick={() => alert('Fonctionnalité à venir')}>
                <i className={icon} />
              </button>
            ))}
          </div>

          <div className="or-divider"><span>{T.or}</span></div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <i className="bi bi-person" />
              <input className="form-input" type="text" name="name"
                value={regForm.name} onChange={handleRegChange}
                placeholder={T.name} required />
            </div>
            <div className="input-group">
              <i className="bi bi-envelope" />
              <input className="form-input" type="email" name="email"
                value={regForm.email} onChange={handleRegChange}
                placeholder={T.email} required />
            </div>
            <div className="input-group">
              <i className="bi bi-lock" />
              <input className="form-input"
                type={showRegPass ? 'text' : 'password'}
                name="password"
                value={regForm.password}
                onChange={handleRegChange}
                placeholder={T.password} required />
              <button type="button" className="input-eye"
                onClick={() => setShowRegPass(!showRegPass)}>
                <i className={`bi bi-${showRegPass ? 'eye-slash' : 'eye'}`} />
              </button>
            </div>
            <div className="input-group">
              <i className="bi bi-telephone" />
              <input className="form-input" type="tel" name="phone"
                value={regForm.phone} onChange={handleRegChange}
                placeholder={T.phone} />
            </div>

            {error && isRight && (
              <div className="form-error">
                <i className="bi bi-exclamation-triangle-fill" /> {error}
              </div>
            )}

            <button className="submit-btn" type="submit" disabled={loading}>
              {loading
                ? <><div className="spinner-sm" />{T.loading}</>
                : <><i className="bi bi-person-check" />{T.submitReg}</>
              }
            </button>
          </form>

          {/* ✅ BOUTON URGENCE DANS LE FORMULAIRE INSCRIPTION */}
          <button className="emergency-link" onClick={handleEmergency}>
            <i className="bi bi-lightning-charge-fill" />
            {T.emergency}
          </button>
        </div>

        {/* OVERLAY GLISSANT */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <img src="/logo.png" alt="SafeZone" className="overlay-logo" />
              <h3 className="overlay-title">{T.overlayL}</h3>
              <p className="overlay-text">{T.overlayLsub}</p>
              <button className="overlay-btn" onClick={() => { setIsRight(false); setError('') }}>
                <i className="bi bi-box-arrow-in-right" /> {T.overlayLbtn}
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <img src="/logo.png" alt="SafeZone" className="overlay-logo" />
              <h3 className="overlay-title">{T.overlayR}</h3>
              <p className="overlay-text">{T.overlayRsub}</p>
              <button className="overlay-btn" onClick={() => { setIsRight(true); setError('') }}>
                <i className="bi bi-person-plus" /> {T.overlayRbtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}