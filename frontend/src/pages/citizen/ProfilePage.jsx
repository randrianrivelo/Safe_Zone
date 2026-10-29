import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import Navbar from '../../components/layout/Navbar'
import { storage } from '../../utils/helpers'
import './ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { theme } = useThemeStore()
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-accent', localStorage.getItem('sz_accent') || 'purple')
    if (user) {
      setForm({ name: user.name || '', phone: '', email: user.email || '' })
      loadAvatar()
    }
  }, [theme, user])

  const getToken = () => {
    const token = storage.get('token')
    if (!token) return null
    if (typeof token === 'object' && token.access_token) {
      return token.access_token
    }
    if (typeof token === 'string') {
      if (token.startsWith('"') && token.endsWith('"')) {
        return token.slice(1, -1)
      }
      return token
    }
    return null
  }

  const loadAvatar = async () => {
    try {
      const token = getToken()
      if (!token || !user?.id) return

      const res = await fetch(`http://localhost:8000/api/user/avatar/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (data.avatar_url) {
          setAvatarUrl(`http://localhost:8000${data.avatar_url}`)
        }
      }
    } catch (err) {
      console.error('Erreur chargement avatar:', err)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert(fr ? 'Veuillez sélectionner une image' : 'Mifidiana sary')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(fr ? 'L\'image ne doit pas dépasser 2 Mo' : 'Ny sary dia tsy tokony mihoatra 2 Mo')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = getToken()
      if (!token) {
        alert(fr ? 'Vous devez être connecté' : 'Mila miditra aloha ianao')
        return
      }

      const res = await fetch('http://localhost:8000/api/user/avatar', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (res.ok) {
        const data = await res.json()
        if (data.avatar_url) {
          setAvatarUrl(`http://localhost:8000${data.avatar_url}`)
          alert(fr ? 'Photo de profil mise à jour !' : 'Sary profil nohavaozina !')
        }
      } else if (res.status === 401) {
        alert(fr ? 'Session expirée, veuillez vous reconnecter' : 'Lasa ny session, midira indray')
        logout()
        navigate('/login')
      } else {
        throw new Error('Upload failed')
      }
    } catch (err) {
      console.error('Erreur upload:', err)
      alert(fr ? 'Erreur lors de l\'upload' : 'Olana tamin\'ny fampidirana sary')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      const token = getToken()
      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: form.name, phone: form.phone })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        // Mettre à jour le store utilisateur
        const userData = storage.get('user')
        if (userData) {
          userData.name = form.name
          storage.set('user', userData)
        }
      } else if (response.status === 401) {
        alert(fr ? 'Session expirée' : 'Lasa ny session')
        logout()
        navigate('/login')
      }
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      alert(fr ? 'Erreur lors de la sauvegarde' : 'Olana tamin\'ny fitehirizana')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm(fr ? 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.' : 'Tena te hamafa ny kaontinao ve ianao ? Tsy azo averina izany.')) {
      try {
        const token = getToken()
        await fetch('http://localhost:8000/api/user/delete', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        logout()
        navigate('/')
      } catch (err) {
        console.error('Erreur suppression:', err)
        alert(fr ? 'Erreur lors de la suppression' : 'Olana tamin\'ny famafana')
      }
    }
  }

  return (
    <div className="profile">
      <Navbar />
      <main className="profile__main">
        <h1 className="profile__title">
          <i className="bi bi-person-circle" />
          {fr ? 'Mon profil' : 'Ny mombamomba ahy'}
        </h1>

        <div className="profile__grid">
          {/* Avatar */}
          <div className="profile__card profile__avatar-card">
            <div className="profile__avatar">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="profile__avatar-img" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarUpload}
            />
            <button
              className="profile__avatar-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <i className="bi bi-camera" />
              {uploading ? (fr ? 'Chargement...' : 'Mampiditra...') : (fr ? 'Changer la photo' : 'Hanova ny sary')}
            </button>
            <h3>{user?.name || 'Utilisateur'}</h3>
            <span className="profile__role-badge">
              {user?.role || 'citizen'}
            </span>
            <p>{user?.email}</p>
          </div>

          {/* Informations personnelles */}
          <div className="profile__card">
            <h3 className="profile__card-title">
              <i className="bi bi-pencil-square" />
              {fr ? 'Informations personnelles' : 'Mombamomba manokana'}
            </h3>

            <div className="profile__field">
              <label>{fr ? 'Nom complet' : 'Anarana feno'}</label>
              <div className="profile__input-wrap">
                <i className="bi bi-person" />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jean Rakoto"
                />
              </div>
            </div>

            <div className="profile__field">
              <label>Email</label>
              <div className="profile__input-wrap">
                <i className="bi bi-envelope" />
                <input value={form.email} disabled className="profile__input--disabled" />
              </div>
            </div>

            <div className="profile__field">
              <label>{fr ? 'Téléphone' : 'Finday'}</label>
              <div className="profile__input-wrap">
                <i className="bi bi-telephone" />
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+261 34 00 000 00"
                />
              </div>
            </div>

            {saved && (
              <div className="profile__success">
                <i className="bi bi-check-circle" />
                {fr ? 'Profil mis à jour !' : 'Profil voaova !'}
              </div>
            )}

            <button className="profile__save-btn" onClick={handleSave} disabled={loading}>
              {loading
                ? <><div className="spinner-sm" /> {fr ? 'Sauvegarde...' : 'Mitahiry...'}</>
                : <><i className="bi bi-check-lg" /> {fr ? 'Sauvegarder' : 'Tahirizo'}</>
              }
            </button>
          </div>

          {/* Suppression compte */}
          <div className="profile__card profile__danger-card">
            <h3 className="profile__card-title">
              <i className="bi bi-exclamation-triangle" />
              {fr ? 'Zone dangereuse' : 'Faritra mampidi-doza'}
            </h3>
            <p className="profile__card-desc">
              {fr
                ? 'La suppression de votre compte est définitive. Toutes vos données seront effacées.'
                : 'Ny famafana ny kaontinao dia farany. Ny angonao rehetra dia hofafana.'}
            </p>
            <button className="profile__delete-btn" onClick={handleDeleteAccount}>
              <i className="bi bi-trash" />
              {fr ? 'Supprimer mon compte' : 'Hamafa ny kaontiko'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}