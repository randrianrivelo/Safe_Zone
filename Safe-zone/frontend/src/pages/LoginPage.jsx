// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './LoginPage.css';

export default function LoginPage() {
  const [mode, setMode]           = useState('login'); // 'login' | 'register'
  const [form, setForm]           = useState({ username: '', email: '', password: '' });
  const [loading, setLoading]     = useState(false);
  const [showPwd, setShowPwd]     = useState(false);
  const { login }                 = useAuth();
  const { toast }                 = useToast();
  const navigate                  = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email: form.email, password: form.password });
      login(data.user);
      toast.success('Bienvenue ' + data.user.username + ' !');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', { username: form.username, email: form.email, password: form.password });
      toast.success('Compte créé ! Connectez-vous.');
      setMode('login');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg__orb login-bg__orb--1" />
        <div className="login-bg__orb login-bg__orb--2" />
        <div className="login-bg__orb login-bg__orb--3" />
        <div className="login-bg__grid" />
      </div>

      <div className="login-container">
        {/* LEFT PANEL — Login */}
        <div className={`login-panel login-panel--left ${mode === 'login' ? 'login-panel--active' : ''}`}>
          <h2 className="login-panel__title">Bienvenue !</h2>
          <p className="login-panel__sub">
            Connectez-vous pour accéder à votre espace <span className="login-brand">SafeZone</span>
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <span className="login-field__icon">✉</span>
              <input
                className="login-field__input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={set('email')}
                required
                autoComplete="email"
              />
            </div>
            <div className="login-field">
              <span className="login-field__icon">🔒</span>
              <input
                className="login-field__input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={form.password}
                onChange={set('password')}
                required
                autoComplete="current-password"
              />
              <button type="button" className="login-field__eye" onClick={() => setShowPwd(p => !p)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? <span className="login-submit__spinner" /> : 'SE CONNECTER →'}
            </button>
          </form>

          <p className="login-switch">
            Pas encore de compte ?{' '}
            <button onClick={() => setMode('register')}>S'inscrire</button>
          </p>

          <p className="login-trust">🛡 Votre sécurité, notre priorité.</p>
        </div>

        {/* DIVIDER TOGGLE */}
        <div className="login-divider">
          <button
            className="login-divider__btn"
            onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
            title="Basculer"
          >
            &lt;/&gt;
          </button>
        </div>

        {/* RIGHT PANEL — Register */}
        <div className={`login-panel login-panel--right ${mode === 'register' ? 'login-panel--active' : ''}`}>
          <h2 className="login-panel__title">Créer un compte</h2>
          <p className="login-panel__sub">
            Rejoignez <span className="login-brand">SafeZone</span> et restez informé en temps réel
          </p>

          <form className="login-form" onSubmit={handleRegister}>
            <div className="login-field">
              <span className="login-field__icon">👤</span>
              <input
                className="login-field__input"
                type="text"
                placeholder="Nom complet"
                value={form.username}
                onChange={set('username')}
                required
              />
            </div>
            <div className="login-field">
              <span className="login-field__icon">✉</span>
              <input
                className="login-field__input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>
            <div className="login-field">
              <span className="login-field__icon">🔒</span>
              <input
                className="login-field__input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={form.password}
                onChange={set('password')}
                required
              />
              <button type="button" className="login-field__eye" onClick={() => setShowPwd(p => !p)}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? <span className="login-submit__spinner" /> : "S'INSCRIRE →"}
            </button>
          </form>

          <p className="login-switch">
            Déjà un compte ?{' '}
            <button onClick={() => setMode('login')}>Se connecter</button>
          </p>
        </div>

        {/* FAR RIGHT — Brand panel */}
        <div className="login-brand-panel">
          <div className="login-brand-panel__logo">
            <span>🛡️</span>
            <div>
              <strong>SafeZone</strong>
              <small>Analamanga 2035</small>
            </div>
          </div>

          <div className="login-brand-panel__hero">
            <h1>Ensemble,<br />restons en <em>sécurité</em><br />à tout moment.</h1>
            <p>SafeZone vous guide vers les zones sûres et vous alerte en cas de danger.</p>
          </div>

          <div className="login-brand-panel__map-illus">
            <div className="map-pin map-pin--green">🏠</div>
            <div className="map-pin map-pin--red">⚠️</div>
            <div className="map-pin map-pin--blue">👤</div>
            <svg className="map-route" viewBox="0 0 200 120">
              <path d="M 160 95 Q 120 60 80 70 Q 50 78 40 45"
                    stroke="#578098" strokeWidth="2" strokeDasharray="5,4"
                    fill="none" opacity="0.7" />
            </svg>
          </div>

          <div className="login-brand-panel__features">
            {[
              { icon: '🔔', label: 'Alertes en temps réel' },
              { icon: '🛡️', label: 'Zones sûres' },
              { icon: '🗺️', label: 'Guidage intelligent' },
              { icon: '👥', label: 'Communauté' },
            ].map(f => (
              <div key={f.label} className="login-feature">
                <span>{f.icon}</span>
                <small>{f.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="login-footer">
        © 2035 <span className="login-brand">SafeZone Analamanga 2035</span>. Tous droits réservés.
      </p>
    </div>
  );
}