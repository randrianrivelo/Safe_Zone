import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'

const getAuthToken = () => {
  let token = localStorage.getItem('token')
  if (!token) return null
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1)
  }
  return token
}

export default function AdminEmergencySettings() {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const [newCode, setNewCode] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [currentCode, setCurrentCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadCurrentCode()
  }, [theme])

  const loadCurrentCode = async () => {
    try {
      const token = getAuthToken()
      const res = await fetch('http://localhost:8000/api/emergency/current-code', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentCode(data.code)
      }
    } catch (err) {
      console.error('Erreur:', err)
      setCurrentCode('1234')
    }
  }

  const handleUpdateCode = async () => {
    if (newCode.length !== 4 || !/^\d{4}$/.test(newCode)) {
      setError(fr ? 'Le code doit contenir 4 chiffres' : 'Ny kaody dia tsy maintsy 4 isa')
      return
    }
    if (newCode !== confirmCode) {
      setError(fr ? 'Les codes ne correspondent pas' : 'Tsy mitovy ny kaody')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = getAuthToken()
      const res = await fetch('http://localhost:8000/api/emergency/update-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_code: newCode, confirm_code: confirmCode })
      })

      if (res.ok) {
        setSuccess(fr ? '✅ Code urgence mis à jour !' : '✅ Kaody maika nohavaozina !')
        setCurrentCode(newCode)
        setNewCode('')
        setConfirmCode('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.detail || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      setError(fr ? 'Erreur de connexion' : 'Olana tamin\'ny fifandraisana')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="bi bi-shield-lock"></i> {fr ? 'Configuration code urgence' : 'Fanamboarana kaody maika'}
        </h1>

        <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>

          <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-input)', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>{fr ? 'Code actuel :' : 'Kaody ankehitriny :'}</strong>{' '}
              <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '4px' }}>{currentCode || '1234'}</span>
            </p>
          </div>

          {success && (
            <div style={{ background: 'rgba(57,255,136,0.1)', padding: '12px', borderRadius: '8px', color: '#39ff88', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-check-circle-fill"></i> {success}
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(255,59,48,0.1)', padding: '12px', borderRadius: '8px', color: '#ff3b30', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {fr ? 'Nouveau code (4 chiffres)' : 'Kaody vaovao (4 isa)'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              style={{
                width: '200px',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '8px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              {fr ? 'Confirmer le code' : 'Hamafiso ny kaody'}
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              style={{
                width: '200px',
                padding: '12px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '1.2rem',
                textAlign: 'center',
                letterSpacing: '8px'
              }}
            />
          </div>

          <button
            onClick={handleUpdateCode}
            disabled={loading}
            style={{
              padding: '10px 24px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (fr ? 'Mise à jour...' : 'Fanavaozana...') : (fr ? 'Mettre à jour' : 'Havaozina')}
          </button>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '8px 20px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className="bi bi-arrow-left"></i> {fr ? 'Retour au dashboard' : 'Hiverina'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}