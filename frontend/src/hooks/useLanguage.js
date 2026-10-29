import { create } from 'zustand'
import { storage } from '../utils/helpers'

// Traductions
const translations = {
  fr: {
    // Navigation
    home:        'Accueil',
    map:         'Carte',
    shelters:    'Refuges',
    alerts:      'Alertes',
    profile:     'Profil',
    settings:    'Paramètres',
    logout:      'Déconnexion',
    dashboard:   'Tableau de bord',
    // Actions
    find_shelter:'Trouver un refuge',
    emergency:   'URGENCE',
    login:       'Connexion',
    register:    'Inscription',
    // Statuts
    open:        'Ouvert',
    full:        'Saturé',
    closed:      'Fermé',
    preparing:   'En préparation',
    // Carte
    my_position: 'Ma position',
    route:       'Itinéraire',
    distance:    'Distance',
    time:        'Temps estimé',
    // Formulaires
    email:       'Email',
    password:    'Mot de passe',
    name:        'Nom complet',
    phone:       'Téléphone',
    // Messages
    loading:     'Chargement...',
    error:       'Une erreur est survenue',
    success:     'Succès',
    // Mode urgence
    urgency_mode:'Mode urgence',
    enter_pin:   'Entrez votre code PIN',
    // Météo
    weather:     'Météo',
    forecast:    'Prévisions'
  },
  mg: {
    home:        'Fandraisana',
    map:         'Sarintany',
    shelters:    'Toerana Fiarovana',
    alerts:      'Fampitandremana',
    profile:     'Mombamomba ahy',
    settings:    'Fitamboatra',
    logout:      'Hivoaka',
    dashboard:   'Sehatra fampahalalana',
    find_shelter:'Mitady toerana fiarovana',
    emergency:   'MAIKA',
    login:       'Hiditra',
    register:    'Misoratra',
    open:        'Misokatra',
    full:        'Feno',
    closed:      'Voarindrina',
    preparing:   'Amboariana',
    my_position: 'Ny toerako',
    route:       'Lalana',
    distance:    'Halavirana',
    time:        'Fotoana hatrehina',
    email:       'Email',
    password:    'Teny miafina',
    name:        'Anarana feno',
    phone:       'Laharana finday',
    loading:     'Miandry...',
    error:       'Nisy olana',
    success:     'Tanteraka',
    urgency_mode:'Fomba maika',
    enter_pin:   'Ampidiro ny kaody PIN',
    weather:     'Toetr\'andro',
    forecast:    'Hevitra ho avy'
  }
}

export const useLangStore = create((set, get) => ({
  lang: storage.get('lang') || 'fr',

  setLang: (lang) => {
    storage.set('lang', lang)
    set({ lang })
  },

  t: (key) => {
    const { lang } = get()
    return translations[lang]?.[key] || translations.fr[key] || key
  }
}))

export const useLanguage = () => {
  const { lang, setLang, t } = useLangStore()
  return { lang, setLang, t }
}