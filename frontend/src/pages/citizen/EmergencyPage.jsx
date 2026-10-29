import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'

export default function EmergencyPage() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentCodeHint, setCurrentCodeHint] = useState('1234')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    // Récupérer le code actuel (juste pour affichage)
    fetchCurrentCode()
  }, [theme])

  const fetchCurrentCode = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/emergency/current-code')
      if (res.ok) {
        const data = await res.json()
        setCurrentCodeHint(data.code)
      }
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleKeyPress = (num) => {
    if (code.length < 4) {
      const newCode = code + num
      setCode(newCode)
      if (newCode.length === 4) {
        validateCode(newCode)
      }
    }
  }

  const handleDelete = () => {
    setCode(code.slice(0, -1))
    setError('')
  }

  const validateCode = async (enteredCode) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:8000/api/emergency/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: enteredCode })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Sauvegarder le token
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('emergency_mode', 'true')
        localStorage.setItem('user', JSON.stringify({
          id: 0,
          name: 'Mode Urgence',
          role: 'citizen',
          isUrgence: true
        }))

        // Rediriger vers la carte
        window.location.href = '/map?mode=urgence'
      } else {
        setError(fr ? 'Code incorrect' : 'Diso ny kaody')
        setCode('')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(fr ? 'Erreur de connexion au serveur' : 'Olana tamin\'ny fifandraisana')
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '80px 20px 20px' }}>
        <div style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>

          <div style={{ width: '80px', height: '80px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 59, 48, 0.1)', border: '2px solid rgba(255, 59, 48, 0.3)', borderRadius: '50%', fontSize: '2rem', color: '#ff3b30' }}>
            <i className="bi bi-lightning-charge-fill"></i>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>{fr ? 'Mode Urgence' : 'Fomba Maika'}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
            {fr ? 'Entrez le code d\'urgence' : 'Ampidiro ny kaody maika'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '24px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: '2px solid var(--border)',
                background: i < code.length ? 'var(--accent)' : 'transparent',
                transform: i < code.length ? 'scale(1.1)' : 'none',
                transition: 'all 0.2s'
              }} />
            ))}
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(255, 59, 48, 0.1)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: '8px', color: '#ff3b30', fontSize: '0.85rem', marginBottom: '16px' }}>
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '240px', margin: '0 auto 24px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button key={num} onClick={() => handleKeyPress(num)} disabled={loading} style={{ width: '64px', height: '64px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700', cursor: 'pointer', margin: '0 auto' }}>
                {num}
              </button>
            ))}
            <div style={{ width: '64px', height: '64px' }} />
            <button onClick={() => handleKeyPress(0)} disabled={loading} style={{ width: '64px', height: '64px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: '700', cursor: 'pointer', margin: '0 auto' }}>
              0
            </button>
            <button onClick={handleDelete} disabled={loading} style={{ width: '64px', height: '64px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: '50%', color: 'var(--text-muted)', fontSize: '1rem', cursor: 'pointer', margin: '0 auto' }}>
              <i className="bi bi-backspace"></i>
            </button>
          </div>

          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            {fr ? 'Contactez l\'administrateur si vous avez perdu le code' : 'Mifandraisa amin\'ny mpitantana raha very ny kaody'}
          </p>

          <button onClick={() => navigate('/')} disabled={loading} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
            <i className="bi bi-arrow-left"></i> {fr ? 'Retour' : 'Hiverina'}
          </button>
        </div>
      </div>
    </div>
  )
}