// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

export const THEMES = {
  light: {
    name: 'Clair Naturel',
    icon: 'bi-sun-fill',
    '--bg-primary': '#F0FBFA',
    '--bg-secondary': '#CBE4ED',
    '--bg-card': 'rgba(255,255,255,0.92)',
    '--bg-glass': 'rgba(255,255,255,0.65)',
    '--bg-input': 'rgba(44,125,160,0.06)',
    '--border': '#87ADC6',
    '--text-primary': '#203038',
    '--text-secondary': '#578098',
    '--text-muted': '#8faabc',
    '--accent': '#2c7da0',
    '--safe': '#1fbc34',
    '--danger': '#e74c3c',
    '--warning': '#f39c12',
    '--primary': '#2c7da0',
    '--shadow': '0 8px 32px rgba(44,125,160,0.15)',
    '--map-filter': 'none',
    '--overlay-bg': 'rgba(240,251,250,0.25)',
    '--map-tile': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  },
  dark: {
    name: 'Sobre Professionnel',
    icon: 'bi-moon-fill',
    '--bg-primary': '#1A2D42',
    '--bg-secondary': '#2E4156',
    '--bg-card': 'rgba(46,65,86,0.92)',
    '--bg-glass': 'rgba(26,45,66,0.78)',
    '--bg-input': 'rgba(255,255,255,0.06)',
    '--border': '#AAB7B7',
    '--text-primary': '#FFFFFF',
    '--text-secondary': '#C0C8CA',
    '--text-muted': '#8fa5b5',
    '--accent': '#D4D8DD',
    '--safe': '#1fbc34',
    '--danger': '#e74c3c',
    '--warning': '#f39c12',
    '--primary': '#4a9cc7',
    '--shadow': '0 8px 32px rgba(0,0,0,0.5)',
    '--map-filter': 'brightness(0.55) contrast(1.2) saturate(0.7)',
    '--overlay-bg': 'rgba(26,45,66,0.58)',
    '--map-tile': 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
  },
  green: {
    name: 'Vert Apaisant',
    icon: 'bi-tree-fill',
    '--bg-primary': '#E7F5DC',
    '--bg-secondary': '#CFE1B9',
    '--bg-card': 'rgba(231,245,220,0.92)',
    '--bg-glass': 'rgba(207,225,185,0.68)',
    '--bg-input': 'rgba(114,129,86,0.06)',
    '--border': '#B6C99B',
    '--text-primary': '#728156',
    '--text-secondary': '#88976C',
    '--text-muted': '#a0b07a',
    '--accent': '#98A77C',
    '--safe': '#4caf50',
    '--danger': '#e74c3c',
    '--warning': '#ff9800',
    '--primary': '#728156',
    '--shadow': '0 8px 32px rgba(114,129,86,0.15)',
    '--map-filter': 'sepia(0.15) saturate(1.1)',
    '--overlay-bg': 'rgba(231,245,220,0.28)',
    '--map-tile': 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png'
  }
}

const ThemeContext = createContext()

function applyTheme(t) {
  const vars = THEMES[t]
  if (!vars) return
  Object.entries(vars).forEach(([key, val]) => {
    if (key.startsWith('--')) {
      document.documentElement.style.setProperty(key, val)
    }
  })
  document.documentElement.setAttribute('data-theme', t)
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    const saved = localStorage.getItem('sz_theme')
    const t = (saved && THEMES[saved]) ? saved : 'light'
    setTheme(t)
    applyTheme(t)
  }, [])

  const changeTheme = (t) => {
    if (!THEMES[t]) return
    setTheme(t)
    applyTheme(t)
    localStorage.setItem('sz_theme', t)
  }

  const cycleTheme = () => {
    const keys = Object.keys(THEMES)
    const next = keys[(keys.indexOf(theme) + 1) % keys.length]
    changeTheme(next)
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      themes: THEMES,
      currentTheme: THEMES[theme],
      changeTheme,
      cycleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) return { theme: 'light', themes: THEMES, currentTheme: THEMES.light, changeTheme: () => {}, cycleTheme: () => {} }
  return ctx
}