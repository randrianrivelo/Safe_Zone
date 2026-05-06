// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { useAuth } from '../context/AuthContext'
import { useCommuniques } from '../context/CommuniqueContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { REFUGES_DATA, userService } from '../services/api'
import AnimatedCounter from '../components/UI/AnimatedCounter'
import SwipeCard from '../components/UI/SwipeCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const ROUTES_INITIALES = [
  { id: 1, name: 'Route Ivandry', severity: 'CRITIQUE', repaired: false },
  { id: 2, name: 'RN7 km 45', severity: 'URGENT', repaired: false },
  { id: 3, name: 'Rue Ambohibao', severity: 'MODÉRÉ', repaired: false }
]

const ACTIVE_TABS = ['kpi', 'users', 'communiques', 'routes', 'graphs']

export default function AdminPage() {
  const { currentUser, allUsers, isAdmin } = useAuth()
  const { communiques, addCommunique, deleteCommunique, broadcastCommunique, broadcastAll } = useCommuniques()
  const { addToast } = useToast()
  const { currentTheme } = useTheme()

  const [activeTab, setActiveTab] = useState('kpi')
  const [routes, setRoutes] = useState(ROUTES_INITIALES)
  const [userSearch, setUserSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [time, setTime] = useState(new Date())
  const [commForm, setCommForm] = useState({ title: '', message: '', expiresAt: '', severity: 'info' })
  const [newRoute, setNewRoute] = useState({ name: '', severity: 'MODÉRÉ' })

  // Accès restreint
  if (!isAdmin) {
    return (
      <div style={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: 40 }}>
          <i className="bi bi-shield-x-fill" style={{ fontSize: '3rem', color: 'var(--danger)', display: 'block', marginBottom: 16 }}></i>
          <h2 style={{ color: 'var(--text-primary)' }}>Accès refusé</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Connectez-vous avec un compte administrateur</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const totalCap = REFUGES_DATA.reduce((s, r) => s + r.capacity, 0)
  const totalOcc = REFUGES_DATA.reduce((s, r) => s + r.occupancy, 0)
  const available = totalCap - totalOcc
  const availPct = Math.round((available / totalCap) * 100)

  const textColor = currentTheme?.['--text-secondary'] || '#578098'
  const borderColor = currentTheme?.['--border'] || '#87ADC6'
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } }, scales: { x: { ticks: { color: textColor, font: { size: 9 } }, grid: { color: borderColor + '44' } }, y: { ticks: { color: textColor }, grid: { color: borderColor + '44' } } } }

  // Actions
  const handleAlertUser = async (user) => {
    await userService.alertUser(user.id, 'Rejoignez le refuge le plus proche immédiatement!')
    console.log(`📱 ALERTE → ${user.name} (${user.email})`)
    addToast('Alerte envoyée', `Notification envoyée à ${user.name}`, 'success')
  }

  const handleLocateUser = (user) => {
    setSelectedUser({ ...user, type: 'locate' })
    setShowUserModal(true)
  }

  const handleViewProfile = (user) => {
    setSelectedUser({ ...user, type: 'profile' })
    setShowUserModal(true)
  }

  const handleCreateComm = () => {
    if (!commForm.title || !commForm.message) {
      addToast('Erreur', 'Remplissez le titre et le message', 'error')
      return
    }
    addCommunique(commForm)
    setCommForm({ title: '', message: '', expiresAt: '', severity: 'info' })
    addToast('Communiqué publié', `"${commForm.title}" est maintenant visible`, 'success')
  }

  const handleBroadcastComm = (id) => {
    broadcastCommunique(id)
    addToast('Diffusion envoyée', 'Communiqué envoyé à tous les utilisateurs', 'success')
  }

  const handleAddRoute = () => {
    if (!newRoute.name) { addToast('Erreur', 'Entrez un nom de route', 'error'); return }
    setRoutes(prev => [...prev, { id: Date.now(), ...newRoute, repaired: false }])
    setNewRoute({ name: '', severity: 'MODÉRÉ' })
    addToast('Route ajoutée', `${newRoute.name} signalée comme endommagée`, 'warning')
  }

  const handleRepairRoutes = () => {
    const toRepair = routes.filter(r => r.repaired)
    if (!toRepair.length) { addToast('Info', 'Cochez les routes à réparer', 'warning'); return }
    setRoutes(prev => prev.filter(r => !r.repaired))
    addToast('Routes réparées', `${toRepair.length} route(s) réparée(s)`, 'success')
  }

  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const tabs = [
    { id: 'kpi', label: 'Vue générale', icon: 'bi-speedometer2' },
    { id: 'users', label: 'Utilisateurs', icon: 'bi-people-fill' },
    { id: 'communiques', label: 'Communiqués', icon: 'bi-megaphone-fill' },
    { id: 'routes', label: 'Routes', icon: 'bi-sign-stop-fill' },
    { id: 'graphs', label: 'Graphiques', icon: 'bi-bar-chart-fill' }
  ]

  return (
    <div style={{ padding: 22, maxWidth: 1380, margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <h1 style={{ fontSize: '1.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-grid-fill" style={{ color: 'var(--safe)' }}></i>
          Dashboard Admin
        </h1>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {time.toLocaleTimeString('fr-FR')} — {time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Refuges actifs', icon: 'bi-house-check-fill', value: REFUGES_DATA.length, color: 'var(--safe)', note: '100% opérationnels', dir: 'up' },
          { label: 'Places restantes', icon: 'bi-people-fill', value: available, color: 'var(--primary)', note: `${availPct}% disponible`, dir: 'up' },
          { label: 'Routes coupées', icon: 'bi-sign-stop-fill', value: routes.length, color: 'var(--warning)', note: 'Rte Ivandry, RN7', dir: 'dn' },
          { label: 'Alertes actives', icon: 'bi-bell-fill', value: 2, color: 'var(--danger)', note: 'Cyclone en cours', dir: 'dn' },
          { label: 'Utilisateurs connectés', icon: 'bi-wifi', value: 1280, color: 'var(--primary)', note: 'En ligne maintenant', dir: 'up' }
        ].map((kpi, i) => (
          <SwipeCard key={i} direction="up" delay={i * 80}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 13,
              padding: 17, boxShadow: 'var(--shadow)', borderLeft: `4px solid ${kpi.color}`
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9 }}>
                <i className={`bi ${kpi.icon}`} style={{ color: kpi.color, fontSize: '1.1rem' }}></i>
              </div>
              <div style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.85rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
                <AnimatedCounter end={kpi.value} />
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: 3 }}>{kpi.label}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: 5, color: kpi.dir === 'up' ? 'var(--safe)' : 'var(--danger)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <i className={`bi bi-arrow-${kpi.dir}`}></i> {kpi.note}
              </div>
            </div>
          </SwipeCard>
        ))}
      </div>

      {/* ONGLETS */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 18, background: 'var(--bg-input, rgba(0,0,0,0.04))', borderRadius: 9, padding: 4, border: '1px solid var(--border)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, minWidth: 110, padding: '9px 8px', border: 'none',
              background: activeTab === t.id ? 'var(--safe)' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-secondary)',
              borderRadius: 7, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.3s'
            }}
          >
            <i className={`bi ${t.icon}`}></i>
            <span className="d-none d-md-inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ===================== VUE GÉNÉRALE ===================== */}
      {activeTab === 'kpi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          {/* Tableau refuges */}
          <div style={{ gridColumn: '1/-1' }} className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-house-heart-fill" style={{ color: 'var(--safe)' }}></i> Refuges en temps réel
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr><th>Nom</th><th>Type</th><th>Cap.</th><th>Occupé</th><th>Disponible</th><th>Remplissage</th><th>Équip.</th><th>Statut</th></tr>
                </thead>
                <tbody>
                  {REFUGES_DATA.map(r => {
                    const av = r.capacity - r.occupancy
                    const pct = Math.round((r.occupancy / r.capacity) * 100)
                    const bc = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--safe)'
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</td>
                        <td><span className="pill info">{r.type}</span></td>
                        <td>{r.capacity}</td>
                        <td>{r.occupancy}</td>
                        <td style={{ color: av > 0 ? 'var(--safe)' : 'var(--danger)', fontWeight: 700 }}>{av}</td>
                        <td style={{ minWidth: 110 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: bc, borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', minWidth: 28 }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          {r.water && <i className="bi bi-droplet-fill" style={{ color: '#3b82f6', marginRight: 3 }}></i>}
                          {r.elec && <i className="bi bi-lightning-fill" style={{ color: 'var(--warning)', marginRight: 3 }}></i>}
                          {r.med && <i className="bi bi-heart-pulse-fill" style={{ color: 'var(--danger)' }}></i>}
                        </td>
                        <td>{av > 0 ? <span className="pill open">Ouvert</span> : <span className="pill full">Plein</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions rapides + dispo */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-lightning-fill" style={{ color: 'var(--warning)' }}></i> Actions rapides
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Ajouter refuge', icon: 'bi-plus-circle-fill', color: 'var(--safe)', action: () => addToast('Refuge', 'Fonctionnalité disponible prochainement', 'info') },
                { label: 'Bloquer route', icon: 'bi-x-octagon-fill', color: 'var(--danger)', action: () => { setActiveTab('routes'); addToast('Route', 'Allez sur l\'onglet Routes', 'warning') } },
                { label: 'Créer alerte', icon: 'bi-bell-fill', color: 'var(--warning)', action: () => { setActiveTab('communiques') } },
                { label: 'Envoyer SMS', icon: 'bi-chat-dots-fill', color: 'var(--primary)', action: () => { console.log('📱 SMS ALERTE GLOBALE'); addToast('SMS envoyé', 'Message diffusé à tous les utilisateurs', 'success') } },
                { label: 'Simuler crise', icon: 'bi-tornado', color: 'var(--danger)', action: () => { console.log('🌀 SIMULATION CYCLONE'); addToast('Simulation', 'Crise cyclone simulée — Alerte envoyée', 'warning') } },
                { label: 'Diffuser tout', icon: 'bi-broadcast', color: 'var(--safe)', action: () => { const n = broadcastAll(); addToast('Diffusion', `${n} communiqués envoyés`, 'success') } }
              ].map((btn, i) => (
                <button key={i} onClick={btn.action} style={{
                  padding: 11, borderRadius: 9, border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.79rem', fontWeight: 500, transition: 'all 0.3s'
                }}>
                  <i className={`bi ${btn.icon}`} style={{ color: btn.color }}></i> {btn.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Disponibilité globale des refuges</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${availPct}%`, height: '100%', background: 'linear-gradient(90deg, var(--safe), #18a22d)', borderRadius: 5, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem', color: availPct > 50 ? 'var(--safe)' : 'var(--warning)' }}>{availPct}%</span>
              </div>
            </div>
          </div>

          {/* Événements */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: 'var(--primary)' }}></i> Événements récents
            </h3>
            {[
              { time: 'Lun 10:00', text: 'Route Ivandry bloquée — inondation', dot: 'var(--danger)' },
              { time: 'Mar 14:30', text: 'Refuge HJRA à 100% de capacité', dot: 'var(--warning)' },
              { time: 'Mer 09:00', text: 'Alerte Cyclone GAMANE catégorie 3', dot: 'var(--danger)' },
              { time: 'Jeu 11:00', text: 'Stade Analamahitsy ouvert', dot: 'var(--safe)' },
              { time: 'Ven 08:00', text: 'Mise à jour routes Alarobia', dot: 'var(--primary)' }
            ].map((ev, i) => (
              <div key={i} style={{ display: 'flex', gap: 11, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: ev.dot, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.69rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: 2 }}>{ev.time}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{ev.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================== UTILISATEURS ===================== */}
      {activeTab === 'users' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '0.97rem', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-people-fill" style={{ color: 'var(--primary)' }}></i> Gestion des utilisateurs ({filteredUsers.length})
            </h3>
            <input
              type="text"
              placeholder="🔍 Rechercher..."
              value={userSearch}
              onChange={e => setUserSearch(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none', maxWidth: 220 }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Nom</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td><span className={`pill ${u.role === 'admin' ? 'full' : 'open'}`}>{u.role === 'admin' ? 'Admin' : 'Citoyen'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 5 }}>
                        {['Localiser', 'Alerter', 'Profil'].map((label, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (i === 0) handleLocateUser(u)
                              else if (i === 1) handleAlertUser(u)
                              else handleViewProfile(u)
                            }}
                            style={{
                              padding: '5px 10px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: '0.71rem', fontWeight: 600,
                              background: ['rgba(44,125,160,0.15)', 'rgba(231,76,60,0.15)', 'rgba(31,188,52,0.15)'][i],
                              color: ['var(--primary)', 'var(--danger)', 'var(--safe)'][i]
                            }}
                          >
                            <i className={['bi bi-geo-alt-fill', 'bi bi-bell-fill', 'bi bi-eye-fill'][i]} style={{ marginRight: 3 }}></i>
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== COMMUNIQUÉS ===================== */}
      {activeTab === 'communiques' && (
        <div style={{ display: 'grid', gap: 18 }}>
          {/* Formulaire création */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-megaphone-fill" style={{ color: 'var(--warning)' }}></i> Créer un communiqué
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
              <input
                className="form-input"
                placeholder="Titre du communiqué *"
                value={commForm.title}
                onChange={e => setCommForm(p => ({ ...p, title: e.target.value }))}
              />
              <input
                className="form-input"
                type="date"
                value={commForm.expiresAt}
                onChange={e => setCommForm(p => ({ ...p, expiresAt: e.target.value }))}
              />
            </div>
            <textarea
              className="form-input"
              placeholder="Message du communiqué..."
              rows={3}
              value={commForm.message}
              onChange={e => setCommForm(p => ({ ...p, message: e.target.value }))}
              style={{ width: '100%', marginBottom: 9, resize: 'vertical' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
              <select
                className="form-input"
                value={commForm.severity}
                onChange={e => setCommForm(p => ({ ...p, severity: e.target.value }))}
              >
                <option value="info">Information</option>
                <option value="warning">Avertissement</option>
                <option value="critical">Urgence critique</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCreateComm} style={{ padding: '9px 18px', background: 'var(--safe)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-plus-lg"></i> Publier
              </button>
              <button onClick={() => { const n = broadcastAll(); addToast('Diffusion globale', `${n} communiqués envoyés`, 'success') }} style={{ padding: '9px 18px', background: 'var(--danger)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="bi bi-broadcast"></i> Diffuser tout
              </button>
            </div>
          </div>

          {/* Liste communiqués */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-archive-fill" style={{ color: 'var(--primary)' }}></i> Historique ({communiques.length})
            </h3>
            {communiques.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 20 }}>Aucun communiqué</p>
            ) : (
              communiques.map(c => {
                const colors = { critical: 'var(--danger)', warning: 'var(--warning)', info: 'var(--primary)' }
                return (
                  <div key={c.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: `3px solid ${colors[c.severity] || colors.info}` }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 3 }}>{c.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 5 }}>{c.message}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', gap: 10 }}>
                        <span><i className="bi bi-calendar3"></i> {c.createdAt}</span>
                        {c.expiresAt && <span><i className="bi bi-clock"></i> Exp: {c.expiresAt}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginLeft: 11 }}>
                      <button onClick={() => handleBroadcastComm(c.id)} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(44,125,160,0.15)', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.71rem', fontWeight: 600 }}>
                        <i className="bi bi-broadcast"></i> Diffuser
                      </button>
                      <button onClick={() => { deleteCommunique(c.id); addToast('Supprimé', 'Communiqué supprimé', 'warning') }} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(231,76,60,0.1)', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.71rem' }}>
                        <i className="bi bi-trash-fill"></i> Supprimer
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* ===================== ROUTES ===================== */}
      {activeTab === 'routes' && (
        <div style={{ display: 'grid', gap: 18 }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-plus-circle-fill" style={{ color: 'var(--safe)' }}></i> Signaler une route endommagée
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 9 }}>
              <input className="form-input" placeholder="Nom de la route *" value={newRoute.name} onChange={e => setNewRoute(p => ({ ...p, name: e.target.value }))} />
              <select className="form-input" value={newRoute.severity} onChange={e => setNewRoute(p => ({ ...p, severity: e.target.value }))}>
                <option>MODÉRÉ</option><option>URGENT</option><option>CRITIQUE</option>
              </select>
            </div>
            <button onClick={handleAddRoute} style={{ padding: '9px 18px', background: 'var(--warning)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-plus-lg"></i> Signaler
            </button>
          </div>
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-sign-stop-fill" style={{ color: 'var(--danger)' }}></i> Routes endommagées ({routes.length})
            </h3>
            {routes.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <input
                  type="checkbox"
                  checked={r.repaired}
                  onChange={() => setRoutes(prev => prev.map(x => x.id === r.id ? { ...x, repaired: !x.repaired } : x))}
                  style={{ width: 15, height: 15, accentColor: 'var(--safe)', cursor: 'pointer' }}
                />
                <label style={{ flex: 1, color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer' }}>{r.name}</label>
                <span style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 700 }}>{r.severity}</span>
              </div>
            ))}
            <button onClick={handleRepairRoutes} style={{ marginTop: 12, padding: '11px 18px', background: 'linear-gradient(135deg, var(--safe), #18a22d)', border: 'none', borderRadius: 9, color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-wrench-adjustable-fill"></i> Réparer les routes sélectionnées
            </button>
          </div>
        </div>
      )}

      {/* ===================== GRAPHIQUES ===================== */}
      {activeTab === 'graphs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={{ gridColumn: '1/-1' }} className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-bar-chart-fill" style={{ color: 'var(--primary)' }}></i> Capacité des refuges
            </h3>
            <div style={{ height: 260 }}>
              <Bar
                data={{
                  labels: REFUGES_DATA.map(r => r.name.substring(0, 15)),
                  datasets: [
                    { label: 'Occupé', data: REFUGES_DATA.map(r => r.occupancy), backgroundColor: 'rgba(231,76,60,0.7)', borderRadius: 4 },
                    { label: 'Disponible', data: REFUGES_DATA.map(r => r.capacity - r.occupancy), backgroundColor: 'rgba(31,188,52,0.7)', borderRadius: 4 }
                  ]
                }}
                options={{ ...chartOpts, scales: { x: { ...chartOpts.scales.x, stacked: true }, y: { ...chartOpts.scales.y, stacked: true } } }}
              />
            </div>
          </div>
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-graph-up" style={{ color: 'var(--safe)' }}></i> Connexions (7 jours)
            </h3>
            <div style={{ height: 240 }}>
              <Line
                data={{
                  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                  datasets: [{ label: 'Utilisateurs', data: [320, 450, 380, 620, 580, 720, 850], borderColor: 'var(--primary)', backgroundColor: 'rgba(44,125,160,0.15)', fill: true, tension: 0.4, pointRadius: 5 }]
                }}
                options={chartOpts}
              />
            </div>
          </div>
          <div className="glass-card">
            <h3 style={{ fontSize: '0.97rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-pie-chart-fill" style={{ color: 'var(--warning)' }}></i> Répartition de l'afflux
            </h3>
            <div style={{ height: 240 }}>
              <Doughnut
                data={{
                  labels: REFUGES_DATA.slice(0, 6).map(r => r.name.substring(0, 14)),
                  datasets: [{ data: REFUGES_DATA.slice(0, 6).map(r => r.occupancy), backgroundColor: ['#1fbc34', '#2c7da0', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c'] }]
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: textColor, font: { size: 10 } } } } }}
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL UTILISATEUR */}
      {showUserModal && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} onClick={() => setShowUserModal(false)} />
          <div style={{ position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 26, maxWidth: 480, width: '90%', boxShadow: 'var(--shadow)', zIndex: 1 }}>
            <button onClick={() => setShowUserModal(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
              <i className="bi bi-x"></i>
            </button>
            {selectedUser.type === 'locate' ? (
              <>
                <h3 style={{ marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-geo-alt-fill" style={{ color: 'var(--primary)' }}></i> Localisation de {selectedUser.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10 }}>Position approximative (simulation)</p>
                <div style={{ height: 220, background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <i className="bi bi-geo-alt-fill" style={{ fontSize: '3rem', color: 'var(--primary)', display: 'block', marginBottom: 8 }}></i>
                    <div style={{ fontSize: '0.82rem' }}>{selectedUser.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>-18.9100, 47.5255</div>
                    <div style={{ fontSize: '0.7rem', marginTop: 5, color: 'var(--text-muted)' }}>Analakely, Antananarivo</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-person-circle" style={{ color: 'var(--safe)' }}></i> Profil de {selectedUser.name}
                </h3>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ width: 65, height: 65, borderRadius: '50%', background: 'linear-gradient(135deg, var(--safe), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#fff', margin: '0 auto 10px' }}>
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{selectedUser.email}</div>
                </div>
                {[
                  { icon: 'bi-telephone-fill', label: 'Téléphone', value: selectedUser.phone },
                  { icon: 'bi-shield-fill', label: 'Rôle', value: selectedUser.role === 'admin' ? 'Administrateur' : 'Citoyen' },
                  { icon: 'bi-house-heart-fill', label: 'Refuge favori', value: selectedUser.fav || 'Non défini' }
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem' }}>
                    <i className={`bi ${row.icon}`} style={{ color: 'var(--safe)', width: 20, textAlign: 'center' }}></i>
                    <span style={{ color: 'var(--text-secondary)', minWidth: 90 }}>{row.label}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}