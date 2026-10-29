// API
export const API_URL = 'http://localhost:8000/api'

// Carte — Centre Antananarivo
export const MAP_CENTER = [-18.9137, 47.5361]
export const MAP_ZOOM   = 12

// Tuiles selon thème
export const MAP_TILES = {
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
}

// Langues
export const LANGS = { FR: 'fr', MG: 'mg' }

// Rôles
export const ROLES = {
  CITIZEN: 'citizen',
  AGENT:   'agent',
  ADMIN:   'admin'
}

// Statuts refuges
export const SHELTER_STATUS = {
  OUVERT:      'ouvert',
  SATURE:      'sature',
  FERME:       'ferme',
  PREPARATION: 'en_preparation'
}

// Types refuges — icônes Bootstrap
export const SHELTER_ICONS = {
  ecole:       'bi-building',
  stade:       'bi-trophy',
  eglise:      'bi-building-fill',
  gymnase:     'bi-geo-alt-fill',
  mairie:      'bi-bank',
  hopital:     'bi-hospital',
  centre_comm: 'bi-people-fill',
  universite:  'bi-mortarboard',
  caserne:     'bi-shield-fill',
  marche:      'bi-shop',
  hangar:      'bi-house-door',
  salle_fete:  'bi-stars'
}

// Couleurs statuts
export const STATUS_COLORS = {
  ouvert:         '#39ff88',
  sature:         '#ff9500',
  ferme:          '#ff3b30',
  en_preparation: '#38bdf8'
}

// Sévérités
export const SEVERITY_COLORS = {
  faible:   '#34c759',
  moyen:    '#ffd60a',
  eleve:    '#ff9500',
  critique: '#ff3b30'
}

// Accents disponibles
export const ACCENTS = [
  { key: 'green',  label: 'Safe Green', color: '#39ff88' },
  { key: 'blue',   label: 'Cyber Blue', color: '#38bdf8' },
  { key: 'purple', label: 'Neon Purple',color: '#a855f7' },
  { key: 'red',    label: 'Alert Red',  color: '#ff3b30' },
  { key: 'gold',   label: 'Gold',       color: '#facc15' }
]

// Provinces météo
export const PROVINCES = [
  { key: 'antananarivo', name: 'Antananarivo', name_mg: 'Antananarivo' },
  { key: 'toamasina',    name: 'Toamasina',    name_mg: 'Toamasina'    },
  { key: 'mahajanga',    name: 'Mahajanga',    name_mg: 'Mahajanga'    },
  { key: 'fianarantsoa', name: 'Fianarantsoa', name_mg: 'Fianarantsoa' },
  { key: 'toliara',      name: 'Toliara',      name_mg: 'Toliara'      },
  { key: 'antsiranana',  name: 'Antsiranana',  name_mg: 'Antsiranana'  }
]