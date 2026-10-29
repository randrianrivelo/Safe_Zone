import { create } from 'zustand'

const KEYS = {
  theme:  'sz_theme',
  accent: 'sz_accent',
  glow:   'sz_glow'
}

// Accent par défaut selon le thème
const getDefaultAccent = (theme) => {
  return theme === 'dark' ? 'purple' : 'green'
}

const apply = (theme, accent, glow) => {
  document.documentElement.setAttribute('data-theme',  theme)
  document.documentElement.setAttribute('data-accent', accent)
  document.documentElement.setAttribute('data-glow',   glow)
}

export const useThemeStore = create((set, get) => ({
  theme:  localStorage.getItem(KEYS.theme)  || 'dark',
  accent: localStorage.getItem(KEYS.accent) || 'purple',
  glow:   localStorage.getItem(KEYS.glow)   || 'medium',

  initTheme: () => {
    const theme  = localStorage.getItem(KEYS.theme)  || 'dark'
    const savedAccent = localStorage.getItem(KEYS.accent)
    const accent = savedAccent || getDefaultAccent(theme)
    const glow   = localStorage.getItem(KEYS.glow)   || 'medium'
    apply(theme, accent, glow)
    set({ theme, accent, glow })
  },

  toggleTheme: () => {
    const { theme, accent, glow } = get()
    const next = theme === 'dark' ? 'light' : 'dark'
    const newAccent = (accent === getDefaultAccent(theme)) ? getDefaultAccent(next) : accent
    localStorage.setItem(KEYS.theme, next)
    localStorage.setItem(KEYS.accent, newAccent)
    apply(next, newAccent, glow)
    set({ theme: next, accent: newAccent })
  },

  setAccent: (accent) => {
    const { theme, glow } = get()
    localStorage.setItem(KEYS.accent, accent)
    apply(theme, accent, glow)
    set({ accent })
  },

  setGlow: (glow) => {
    const { theme, accent } = get()
    localStorage.setItem(KEYS.glow, glow)
    apply(theme, accent, glow)
    set({ glow })
  },

  loadUserTheme: (userId) => {
    if (!userId) return
    const userTheme  = localStorage.getItem(`sz_theme_${userId}`)
    const userAccent = localStorage.getItem(`sz_accent_${userId}`)
    const userGlow   = localStorage.getItem(`sz_glow_${userId}`)

    const theme  = userTheme  || localStorage.getItem(KEYS.theme)  || 'dark'
    const savedAccent = userAccent || localStorage.getItem(KEYS.accent)
    const accent = savedAccent || getDefaultAccent(theme)
    const glow   = userGlow   || localStorage.getItem(KEYS.glow)   || 'medium'

    localStorage.setItem(KEYS.theme,  theme)
    localStorage.setItem(KEYS.accent, accent)
    localStorage.setItem(KEYS.glow,   glow)

    apply(theme, accent, glow)
    set({ theme, accent, glow })
  },

  saveUserTheme: (userId) => {
    if (!userId) return
    const { theme, accent, glow } = get()
    localStorage.setItem(`sz_theme_${userId}`,  theme)
    localStorage.setItem(`sz_accent_${userId}`, accent)
    localStorage.setItem(`sz_glow_${userId}`,   glow)
  },

  onLogout: () => {
    const theme  = localStorage.getItem(KEYS.theme)  || 'dark'
    const savedAccent = localStorage.getItem(KEYS.accent)
    const accent = savedAccent || getDefaultAccent(theme)
    const glow   = localStorage.getItem(KEYS.glow)   || 'medium'
    apply(theme, accent, glow)
    set({ theme, accent, glow })
  }
}))