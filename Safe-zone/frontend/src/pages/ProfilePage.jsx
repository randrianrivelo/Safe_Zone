// src/pages/ProfilePage.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme, THEMES } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import { REFUGES_DATA } from '../services/api'
import AnimatedCounter from '../components/UI/AnimatedCounter'
import SwipeCard from '../components/UI/SwipeCard'

export default function ProfilePage() {
  const { currentUser, updateUser, logout } = useAuth()
  const { theme, changeTheme } = useTheme()
  const { addToast } = useToast()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name || 'Jean Rakoto',
    email: currentUser?.email || 'jean@gmail.com',
    phone: currentUser?.phone || '+261 34 12 345 67',
    address: currentUser?.address || 'Analakely, Antananarivo',
    favoriteRefuge: currentUser?.favoriteRefuge || ''
  })

  const history = [
    { date: '15 Mars 2025', event: 'Orienté vers Stade Alarobia', type: 'success' },
    { date: '12 Mars 2025', event: 'Alerte cyclone GAMANE reçue', type: 'danger' },
    { date: '8 Mars 2025', event: 'Orienté vers Gymnase Ankorondrano', type: 'success' },
    { date: '5 Mars 2025', event: 'Alerte inondation Analakely', type: 'warning' },
    { date: '1 Mars 2025', event: 'Inscription sur Smart SafeZone', type: 'info' }
  ]

  const handleSave = () => {
    updateUser(form)
    setEditing(false)
    addToast('Profil mis à jour', 'Vos informations ont été sauvegardées', 'success')
  }

  const dotColors = { success: 'var(--safe)', danger: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' }
  const icons = { success: 'bi-check-circle-fill', danger: 'bi-exclamation-octagon-fill', warning: 'bi-exclamation-triangle-fill', info: 'bi-person-plus-fill' }

  return (
    <div style={{ padding: 22, maxWidth: 780, margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <SwipeCard direction="up">
        <h1 style={{ marginBottom: 22, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-person-circle" style={{ color: 'var(--safe)' }}></i> Mon Profil
        </h1>
      </SwipeCard>

      {/* Carte profil */}
      <SwipeCard direction="left">
        <div className="glass-card" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ width: 95, height: 95, borderRadius: '50%', background: 'linear-gradient(135deg, var(--safe), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.4rem', color: '#fff', margin: '0 auto 13px', boxShadow: '0 4px 18px rgba(31,188,52,0.3)' }}>
            <i className="bi bi-person-fill"></i>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 4, color: 'var(--text-primary)' }}>{form.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 16 }}>
            {currentUser?.role === 'admin' ? 'Administrateur' : 'Citoyen'} — {form.address}
          </p>

          {editing ? (
            <div style={{ maxWidth: 400, margin: '0 auto', textAlign: 'left' }}>
              {['name', 'email', 'phone', 'address'].map(field => (
                <div key={field} style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    className="auth-input"
                    style={{ margin: 0 }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={handleSave} style={{ flex: 1, padding: '10px', background: 'var(--safe)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  <i className="bi bi-check-lg"></i> Sauvegarder
                </button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ maxWidth: 400, margin: '0 auto 16px', textAlign: 'left' }}>
                {[
                  { icon: 'bi-envelope-fill', label: 'Email', value: form.email },
                  { icon: 'bi-telephone-fill', label: 'Téléphone', value: form.phone },
                  { icon: 'bi-geo-alt-fill', label: 'Adresse', value: form.address }
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <i className={`bi ${row.icon}`} style={{ color: 'var(--safe)', width: 20, textAlign: 'center' }}></i>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 90, fontSize: '0.86rem' }}>{row.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.86rem' }}>{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setEditing(true)} style={{ padding: '9px 22px', background: 'var(--primary)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <i className="bi bi-pencil-fill"></i> Modifier le profil
              </button>
            </>
          )}
        </div>
      </SwipeCard>

      {/* Refuge préféré */}
      <SwipeCard direction="right" delay={100}>
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-house-heart-fill" style={{ color: 'var(--safe)' }}></i> Refuge préféré
          </h3>
          <select
            value={form.favoriteRefuge}
            onChange={e => setForm(p => ({ ...p, favoriteRefuge: e.target.value }))}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="">-- Sélectionner un refuge --</option>
            {REFUGES_DATA.map(r => (
              <option key={r.id} value={r.name}>{r.name} ({r.capacity - r.occupancy} places)</option>
            ))}
          </select>
          {form.favoriteRefuge && (
            <p style={{ fontSize: '0.78rem', color: 'var(--safe)', marginTop: 8 }}>
              <i className="bi bi-check-circle-fill" style={{ marginRight: 5 }}></i>
              Refuge sélectionné : <strong>{form.favoriteRefuge}</strong>
            </p>
          )}
        </div>
      </SwipeCard>

      {/* Sélecteur de thème */}
      <SwipeCard direction="left" delay={150}>
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-palette-fill" style={{ color: 'var(--primary)' }}></i> Thème visuel
          </h3>
          <div style={{ display: 'flex', gap: 9 }}>
            {Object.entries(THEMES).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { changeTheme(key); addToast('Thème changé', `Thème "${val.name}" appliqué`, 'success') }}
                style={{
                  flex: 1, padding: 12, borderRadius: 9, cursor: 'pointer', textAlign: 'center',
                  fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.3s',
                  border: `2px solid ${theme === key ? 'var(--safe)' : 'var(--border)'}`,
                  background: theme === key ? 'rgba(31,188,52,0.1)' : 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                <i className={`bi ${val.icon}`} style={{ display: 'block', marginBottom: 5, fontSize: '1.3rem', color: theme === key ? 'var(--safe)' : 'var(--text-secondary)' }}></i>
                {val.name}
              </button>
            ))}
          </div>
        </div>
      </SwipeCard>

      {/* Statistiques */}
      <SwipeCard direction="right" delay={200}>
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-bar-chart-fill" style={{ color: 'var(--primary)' }}></i> Statistiques personnelles
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 11 }}>
            {[
              { value: 3, label: 'Orientations', icon: 'bi-compass-fill', color: 'var(--primary)' },
              { value: 5, label: 'Alertes reçues', icon: 'bi-bell-fill', color: 'var(--warning)' },
              { value: 12, label: 'Jours actif', icon: 'bi-calendar-check-fill', color: 'var(--safe)' }
            ].map((stat, i) => (
              <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                <i className={`bi ${stat.icon}`} style={{ color: stat.color, fontSize: '1.5rem', display: 'block', marginBottom: 7 }}></i>
                <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  <AnimatedCounter end={stat.value} />
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: 3 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </SwipeCard>

      {/* Historique */}
      <SwipeCard direction="left" delay={250}>
        <div className="glass-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.97rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: 'var(--primary)' }}></i> Historique des alertes
            </h3>
            <button
              onClick={() => addToast('Signalement envoyé', 'Votre problème a été transmis aux administrateurs', 'warning')}
              style={{ padding: '6px 13px', background: 'rgba(243,156,18,0.15)', border: 'none', borderRadius: 8, color: 'var(--warning)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <i className="bi bi-flag-fill"></i> Signaler un problème
            </button>
          </div>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 11, padding: '11px 0', borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: dotColors[h.type], marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: 2 }}>{h.date}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className={`bi ${icons[h.type]}`} style={{ color: dotColors[h.type] }}></i>
                  {h.event}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SwipeCard>

      {/* Déconnexion */}
      <button
        onClick={() => { logout(); addToast('Déconnexion', 'À bientôt !', 'info') }}
        style={{ width: '100%', padding: 14, background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 12, color: 'var(--danger)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '0.9rem' }}
      >
        <i className="bi bi-box-arrow-right"></i> Se déconnecter
      </button>
    </div>
  )
}