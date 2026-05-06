// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// ============================================================
// COMPTES AUTORISÉS
// ============================================================
const ADMIN_EMAIL = 'admin@safezone.mg'
const ADMIN_PASSWORD = 'Admin2035!'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const MOCK_USERS = [
    { id: 1, name: 'Admin SafeZone', email: ADMIN_EMAIL, role: 'admin', phone: '+261 20 22 000 00', fav: 'Tous les refuges' },
    { id: 2, name: 'Jean Rakoto', email: 'jean@gmail.com', role: 'citizen', phone: '+261 34 12 345 67', fav: 'Stade Alarobia' },
    { id: 3, name: 'Marie Rasoanaivo', email: 'marie@gmail.com', role: 'citizen', phone: '+261 34 22 456 78', fav: 'Gymnase Ankorondrano' },
    { id: 4, name: 'Paul Randrianarison', email: 'paul@gmail.com', role: 'citizen', phone: '+261 33 11 567 89', fav: 'Lycée JJ Rabe' },
    { id: 5, name: 'Hanta Ratsimbazafy', email: 'hanta@gmail.com', role: 'citizen', phone: '+261 32 44 678 90', fav: 'Palais Mahamasina' },
    { id: 6, name: 'Solofo Andriamaharo', email: 'solofo@gmail.com', role: 'citizen', phone: '+261 34 55 789 01', fav: 'Centre FJKM' },
    { id: 7, name: 'Fetra Razafimandimby', email: 'fetra@gmail.com', role: 'citizen', phone: '+261 33 66 890 12', fav: 'Université Ankatso' },
    { id: 8, name: 'Noro Rakotovao', email: 'noro@gmail.com', role: 'citizen', phone: '+261 32 77 901 23', fav: 'Stade Alarobia' }
  ]

  // Charger l'utilisateur sauvegardé au démarrage
  useEffect(() => {
    const saved =
      localStorage.getItem('sz_user') ||
      sessionStorage.getItem('sz_user')
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('sz_user')
        sessionStorage.removeItem('sz_user')
      }
    }
  }, [])

  // ===== LOGIN =====
  const login = async (email, password, remember = false) => {
    setLoading(true)

    await new Promise(r => setTimeout(r, 1000)) // Simulation API

    const isAdmin = email === ADMIN_EMAIL

    // Vérification mot de passe admin
    if (isAdmin && password !== ADMIN_PASSWORD) {
      setLoading(false)
      return { success: false, error: 'Mot de passe administrateur incorrect.' }
    }

    const user = {
      id: Date.now(),
      name: isAdmin ? 'Admin SafeZone' : (email.split('@')[0] || 'Utilisateur'),
      email,
      role: isAdmin ? 'admin' : 'citizen',
      phone: '',
      address: 'Antananarivo',
      favoriteRefuge: '',
      createdAt: new Date().toLocaleDateString('fr-FR')
    }

    setCurrentUser(user)

    // Stockage selon "Se souvenir de moi"
    if (remember) {
      localStorage.setItem('sz_user', JSON.stringify(user))
    } else {
      sessionStorage.setItem('sz_user', JSON.stringify(user))
    }

    setLoading(false)
    return { success: true, role: user.role }
  }

  // ===== REGISTER =====
  const register = async ({ name, email, phone, password }) => {
    setLoading(true)

    await new Promise(r => setTimeout(r, 1200)) // Simulation API

    const isAdmin = email === ADMIN_EMAIL
    const user = {
      id: Date.now(),
      name,
      email,
      phone: phone || '',
      role: isAdmin ? 'admin' : 'citizen',
      address: 'Antananarivo',
      favoriteRefuge: '',
      createdAt: new Date().toLocaleDateString('fr-FR')
    }

    // Auto-connexion après inscription
    setCurrentUser(user)
    localStorage.setItem('sz_user', JSON.stringify(user))

    // Ajouter à la liste des utilisateurs mockés
    MOCK_USERS.push({
      ...user,
      lastLogin: 'Maintenant',
      fav: 'Non défini'
    })

    setLoading(false)
    return { success: true, role: user.role }
  }

  // ===== LOGOUT =====
  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('sz_user')
    sessionStorage.removeItem('sz_user')
  }

  // ===== UPDATE USER =====
  const updateUser = (updates) => {
    const updated = { ...currentUser, ...updates }
    setCurrentUser(updated)
    localStorage.setItem('sz_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      allUsers: MOCK_USERS,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAdmin: currentUser?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}