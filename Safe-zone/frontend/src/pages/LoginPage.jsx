// src/pages/LoginPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ============================================================
// INFORMATIONS DE CONNEXION
// ============================================================
// ADMIN  : admin@safezone.mg  /  Admin2035!
// USER   : jean@gmail.com     /  n'importe quel mot de passe
// ============================================================

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, register, loading, currentUser } = useAuth()

  // ===== ÉTAT PRINCIPAL =====
  const [isRightPanel, setIsRightPanel] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ===== DONNÉES FORMULAIRES =====
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    remember: false
  })

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  // Redirection si déjà connecté
  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin' : '/', { replace: true })
    }
  }, [currentUser, navigate])

  // ===== CONNEXION =====
  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!loginData.email || !loginData.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }

    // Vérification mot de passe admin
    if (loginData.email === 'admin@safezone.mg' && loginData.password !== 'Admin2035!') {
      setError('Mot de passe administrateur incorrect.')
      return
    }

    const result = await login(loginData.email, loginData.password, loginData.remember)

    if (result.success) {
      setSuccess('Connexion réussie ! Redirection en cours...')
      setTimeout(() => {
        navigate(result.role === 'admin' ? '/admin' : '/', { replace: true })
      }, 800)
    } else {
      setError('Email ou mot de passe incorrect.')
    }
  }

  // ===== INSCRIPTION =====
  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    const { name, email, phone, password, confirmPassword } = registerData

    if (!name || !email || !password) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    const result = await register({ name, email, phone, password })

    if (result.success) {
      setSuccess('Compte créé ! Redirection...')
      // Redirection directe sans reconnexion
      setTimeout(() => {
        navigate(email === 'admin@safezone.mg' ? '/admin' : '/', { replace: true })
      }, 800)
    } else {
      setError('Erreur lors de la création du compte.')
    }
  }

  // ===== CONNEXION SOCIALE =====
  const socialLogin = async (provider) => {
    setError('')
    setSuccess(`Connexion avec ${provider}...`)
    await login(`${provider.toLowerCase()}@social.com`, 'social123')
    setTimeout(() => navigate('/', { replace: true }), 1000)
  }

  // ===== MOT DE PASSE OUBLIÉ =====
  const forgotPassword = (e) => {
    e.preventDefault()
    if (!loginData.email) {
      setError('Entrez votre email pour récupérer votre mot de passe.')
      return
    }
    setSuccess(`Lien de réinitialisation envoyé à ${loginData.email} (simulation)`)
    console.log(`🔑 Reset password pour : ${loginData.email}`)
  }

  // ===== STYLES =====
  const S = styles(isDark)

  return (
    <div style={S.body}>
      {/* Toggle Mode Clair/Sombre */}
      <button
        onClick={() => setIsDark(!isDark)}
        style={S.themeToggle}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* Conteneur principal */}
      <div
        style={{
          ...S.container,
          ...(isRightPanel ? S.containerActive : {})
        }}
        id="container"
      >

        {/* =====================
            FORMULAIRE INSCRIPTION
            ===================== */}
        <div style={{
          ...S.formContainer,
          ...S.signUpContainer,
          ...(isRightPanel ? S.signUpContainerActive : {})
        }}>
          <form style={S.form} onSubmit={handleRegister}>
            <h1 style={S.h1}>Créer un compte</h1>

            {/* Boutons sociaux */}
            <div style={S.socialContainer}>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Google')} title="Google">
                <i className="fab fa-google"></i>
              </button>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Facebook')} title="Facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Phone')} title="Téléphone">
                <i className="fas fa-phone"></i>
              </button>
            </div>

            <span style={S.span}>ou utilisez votre email</span>

            <input
              style={S.input}
              type="text"
              placeholder="Nom complet *"
              value={registerData.name}
              onChange={e => setRegisterData({ ...registerData, name: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="email"
              placeholder="Email *"
              value={registerData.email}
              onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="tel"
              placeholder="Téléphone (optionnel)"
              value={registerData.phone}
              onChange={e => setRegisterData({ ...registerData, phone: e.target.value })}
            />
            <input
              style={S.input}
              type="password"
              placeholder="Mot de passe *"
              value={registerData.password}
              onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="password"
              placeholder="Confirmer le mot de passe *"
              value={registerData.confirmPassword}
              onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              required
            />

            {/* Messages */}
            {error && <p style={S.errorMsg}><i className="bi bi-exclamation-circle-fill"></i> {error}</p>}
            {success && <p style={S.successMsg}><i className="bi bi-check-circle-fill"></i> {success}</p>}

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? '⏳ Création...' : "S'INSCRIRE"}
            </button>
          </form>
        </div>

        {/* =====================
            FORMULAIRE CONNEXION
            ===================== */}
        <div style={{
          ...S.formContainer,
          ...S.signInContainer,
          ...(isRightPanel ? S.signInContainerActive : {})
        }}>
          <form style={S.form} onSubmit={handleLogin}>
            <h1 style={S.h1}>Connexion</h1>

            {/* Boutons sociaux */}
            <div style={S.socialContainer}>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Google')} title="Google">
                <i className="fab fa-google"></i>
              </button>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Facebook')} title="Facebook">
                <i className="fab fa-facebook-f"></i>
              </button>
              <button type="button" style={S.socialBtn} onClick={() => socialLogin('Phone')} title="Téléphone">
                <i className="fas fa-phone"></i>
              </button>
            </div>

            <span style={S.span}>ou utilisez votre email</span>

            <input
              style={S.input}
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={e => setLoginData({ ...loginData, email: e.target.value })}
              required
            />
            <input
              style={S.input}
              type="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={e => setLoginData({ ...loginData, password: e.target.value })}
              required
            />

            {/* Remember + Forgot */}
            <div style={S.checkRow}>
              <label style={S.checkLabel}>
                <input
                  type="checkbox"
                  style={{ marginRight: 5, accentColor: '#1fbc34' }}
                  checked={loginData.remember}
                  onChange={e => setLoginData({ ...loginData, remember: e.target.checked })}
                />
                Se souvenir de moi
              </label>
              <a href="#" style={S.link} onClick={forgotPassword}>
                Mot de passe oublié ?
              </a>
            </div>

            {/* Messages */}
            {error && <p style={S.errorMsg}><i className="bi bi-exclamation-circle-fill"></i> {error}</p>}
            {success && <p style={S.successMsg}><i className="bi bi-check-circle-fill"></i> {success}</p>}

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? '⏳ Connexion...' : 'SE CONNECTER'}
            </button>

            {/* Hint Admin */}
            <div style={S.adminHint}>
              <i className="bi bi-info-circle" style={{ marginRight: 5 }}></i>
              Admin : <strong>admin@safezone.mg</strong> / <strong>Admin2035!</strong>
            </div>
          </form>
        </div>

        {/* =====================
            OVERLAY ANIMÉ
            ===================== */}
        <div style={{
          ...S.overlayContainer,
          ...(isRightPanel ? S.overlayContainerActive : {})
        }}>
          <div style={{
            ...S.overlay,
            ...(isRightPanel ? S.overlayActive : {})
          }}>

            {/* Panel gauche de l'overlay */}
            <div style={{
              ...S.overlayPanel,
              ...S.overlayLeft,
              ...(isRightPanel ? S.overlayLeftActive : {})
            }}>
              <h1 style={{ ...S.h1, color: 'white' }}>Bienvenue !</h1>
              <p style={S.overlayP}>
                Pour rester connecté, veuillez vous connecter avec vos informations personnelles
              </p>
              <button
                style={S.ghostBtn}
                onClick={() => { setIsRightPanel(false); setError(''); setSuccess('') }}
              >
                SE CONNECTER
              </button>
            </div>

            {/* Panel droit de l'overlay */}
            <div style={{
              ...S.overlayPanel,
              ...S.overlayRight,
              ...(isRightPanel ? S.overlayRightActive : {})
            }}>
              <h1 style={{ ...S.h1, color: 'white' }}>Salut, ami !</h1>
              <p style={S.overlayP}>
                Inscrivez-vous avec vos informations personnelles pour commencer votre aventure
              </p>
              <button
                style={S.ghostBtn}
                onClick={() => { setIsRightPanel(true); setError(''); setSuccess('') }}
              >
                S'INSCRIRE
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Styles CSS globaux (keyframes) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800&display=swap');
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

        @keyframes gradientBG {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes show {
          0%,  49.99% { opacity: 0; z-index: 1; }
          50%, 100%   { opacity: 1; z-index: 5; }
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        input:focus {
          outline: none;
          border: 1px solid #1fbc34 !important;
          box-shadow: 0 0 0 3px rgba(31,188,52,0.15);
        }
      `}</style>
    </div>
  )
}

// ============================================================
// FONCTION STYLES — retourne un objet avec tous les styles
// S'adapte au mode clair/sombre
// ============================================================
function styles(isDark) {
  const transition = '0.6s ease-in-out'

  return {
    // ===== BODY =====
    body: {
      fontFamily: "'Montserrat', sans-serif",
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      margin: 0,
      background: isDark
        ? '#1A2D42'
        : 'linear-gradient(-45deg, #dce3f5, #a8ecb4, #b4c8fe, #1fbc34)',
      backgroundSize: isDark ? 'auto' : '400% 400%',
      animation: isDark ? 'none' : 'gradientBG 12s ease infinite',
      transition: 'background 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
    },

    // ===== TOGGLE THÈME =====
    themeToggle: {
      position: 'fixed',
      top: 20,
      right: 20,
      width: 50,
      height: 50,
      borderRadius: '50%',
      background: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.25)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.3)',
      fontSize: 22,
      cursor: 'pointer',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
      color: 'white',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    },

    // ===== CONTAINER =====
    container: {
      backgroundColor: isDark ? '#2E4156' : '#fff',
      borderRadius: 15,
      boxShadow: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
      position: 'relative',
      overflow: 'hidden',
      width: '768px',
      maxWidth: '95vw',
      minHeight: 580,
      transition,
    },

    containerActive: {},

    // ===== FORM CONTAINER =====
    formContainer: {
      position: 'absolute',
      top: 0,
      height: '100%',
      transition,
    },

    // Sign In — à gauche par défaut
    signInContainer: {
      left: 0,
      width: '50%',
      zIndex: 2,
      transform: 'translateX(0)',
    },

    signInContainerActive: {
      transform: 'translateX(100%)',
    },

    // Sign Up — caché par défaut
    signUpContainer: {
      left: 0,
      width: '50%',
      opacity: 0,
      zIndex: 1,
      transform: 'translateX(0)',
    },

    signUpContainerActive: {
      transform: 'translateX(100%)',
      opacity: 1,
      zIndex: 5,
      animation: 'show 0.6s',
    },

    // ===== FORMULAIRE =====
    form: {
      backgroundColor: isDark ? '#2E4156' : '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 50px',
      height: '100%',
      textAlign: 'center',
      transition: 'background-color 0.3s',
    },

    h1: {
      fontWeight: 'bold',
      margin: '0 0 8px 0',
      color: isDark ? '#FFFFFF' : '#333',
      fontSize: '1.6rem',
    },

    span: {
      fontSize: 12,
      color: isDark ? '#C0C8CA' : '#888',
      marginBottom: 15,
      marginTop: 10,
    },

    input: {
      backgroundColor: isDark ? '#1A2D42' : '#f0f2f5',
      border: isDark ? '1px solid #AAB7B7' : 'none',
      borderRadius: 5,
      padding: '12px 15px',
      margin: '6px 0',
      width: '100%',
      fontSize: 13,
      color: isDark ? '#FFFFFF' : '#333',
      transition: 'all 0.3s',
    },

    // ===== BOUTON PRINCIPAL =====
    btn: {
      borderRadius: 5,
      border: '1px solid #1fbc34',
      backgroundColor: '#1fbc34',
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      padding: '12px 45px',
      letterSpacing: 1,
      textTransform: 'uppercase',
      transition: 'transform 80ms ease-in, background 0.3s',
      cursor: 'pointer',
      marginTop: 12,
      width: '100%',
    },

    // ===== BOUTON GHOST (overlay) =====
    ghostBtn: {
      backgroundColor: 'transparent',
      borderColor: '#FFFFFF',
      border: '1px solid #FFFFFF',
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
      padding: '12px 45px',
      letterSpacing: 1,
      textTransform: 'uppercase',
      cursor: 'pointer',
      borderRadius: 5,
      marginTop: 12,
      transition: 'all 0.3s',
    },

    // ===== SOCIAUX =====
    socialContainer: {
      display: 'flex',
      gap: 10,
      margin: '15px 0 5px',
      justifyContent: 'center',
    },

    socialBtn: {
      border: '1px solid #DDDDDD',
      borderRadius: '50%',
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 40,
      height: 40,
      color: isDark ? '#C0C8CA' : '#333',
      backgroundColor: isDark ? '#1A2D42' : 'transparent',
      cursor: 'pointer',
      fontSize: 15,
      transition: 'all 0.3s',
    },

    // ===== CHECKBOX ROW =====
    checkRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      margin: '10px 0',
      fontSize: 12,
    },

    checkLabel: {
      display: 'flex',
      alignItems: 'center',
      color: isDark ? '#C0C8CA' : '#888',
      cursor: 'pointer',
    },

    link: {
      color: '#1fbc34',
      fontSize: 12,
      textDecoration: 'none',
      fontWeight: 600,
    },

    // ===== MESSAGES =====
    errorMsg: {
      color: '#e74c3c',
      fontSize: 12,
      margin: '6px 0',
      padding: '8px 12px',
      background: 'rgba(231,76,60,0.1)',
      borderRadius: 5,
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },

    successMsg: {
      color: '#1fbc34',
      fontSize: 12,
      margin: '6px 0',
      padding: '8px 12px',
      background: 'rgba(31,188,52,0.1)',
      borderRadius: 5,
      width: '100%',
      textAlign: 'left',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    },

    // ===== HINT ADMIN =====
    adminHint: {
      marginTop: 12,
      fontSize: 11,
      color: isDark ? '#AAB7B7' : '#999',
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      padding: '7px 12px',
      borderRadius: 5,
      width: '100%',
      textAlign: 'center',
      border: `1px dashed ${isDark ? '#AAB7B7' : '#ddd'}`,
    },

    // ===== OVERLAY =====
    overlayContainer: {
      position: 'absolute',
      top: 0,
      left: '50%',
      width: '50%',
      height: '100%',
      overflow: 'hidden',
      transition,
      zIndex: 100,
      transform: 'translateX(0)',
    },

    overlayContainerActive: {
      transform: 'translateX(-100%)',
    },

    overlay: {
      background: 'linear-gradient(to right, #24d63b, #1fbc34)',
      color: '#FFFFFF',
      position: 'relative',
      left: '-100%',
      height: '100%',
      width: '200%',
      transform: 'translateX(0)',
      transition,
    },

    overlayActive: {
      transform: 'translateX(50%)',
    },

    overlayPanel: {
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '0 40px',
      textAlign: 'center',
      top: 0,
      height: '100%',
      width: '50%',
      transition,
    },

    overlayP: {
      fontSize: 14,
      fontWeight: 100,
      lineHeight: 1.5,
      letterSpacing: '0.5px',
      margin: '15px 0 20px',
      color: 'rgba(255,255,255,0.9)',
    },

    // Overlay LEFT
    overlayLeft: {
      transform: 'translateX(-20%)',
    },

    overlayLeftActive: {
      transform: 'translateX(0)',
    },

    // Overlay RIGHT
    overlayRight: {
      right: 0,
      transform: 'translateX(0)',
    },

    overlayRightActive: {
      transform: 'translateX(20%)',
    },
  }
}