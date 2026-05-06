// src/context/CommuniqueContext.jsx
import { createContext, useContext, useState } from 'react'

const CommuniqueContext = createContext()

const INITIAL = [
  {
    id: 1,
    title: "Cyclone GAMANE — Consignes d'évacuation",
    message: 'Tous les citoyens des zones côtières doivent rejoindre immédiatement un refuge.',
    expiresAt: '20 Mars 2025',
    createdAt: '15 Mars 2025',
    severity: 'critical',
    active: true
  },
  {
    id: 2,
    title: 'Ouverture de nouveaux refuges',
    message: '3 nouveaux refuges ouverts dans la région Analamanga. +1500 places.',
    expiresAt: '18 Mars 2025',
    createdAt: '14 Mars 2025',
    severity: 'info',
    active: true
  },
  {
    id: 3,
    title: 'Routes endommagées — Mise à jour',
    message: 'Route Ivandry et RN7 (km 45) fermées suite aux inondations.',
    expiresAt: '17 Mars 2025',
    createdAt: '13 Mars 2025',
    severity: 'warning',
    active: true
  }
]

export function CommuniqueProvider({ children }) {
  const [communiques, setCommuniques] = useState(INITIAL)

  const addCommunique = (data) => {
    const c = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toLocaleDateString('fr-FR'),
      active: true
    }
    setCommuniques(prev => [c, ...prev])
    return c
  }

  const deleteCommunique = (id) => {
    setCommuniques(prev => prev.filter(c => c.id !== id))
  }

  const broadcastCommunique = (id) => {
    const c = communiques.find(x => x.id === id)
    if (c) console.log(`📢 DIFFUSION: ${c.title} — ${c.message}`)
    return !!c
  }

  const broadcastAll = () => {
    communiques.forEach(c => console.log(`📢 ${c.title}: ${c.message}`))
    return communiques.length
  }

  return (
    <CommuniqueContext.Provider value={{
      communiques,
      activeCommuniques: communiques.filter(c => c.active),
      addCommunique,
      deleteCommunique,
      broadcastCommunique,
      broadcastAll
    }}>
      {children}
    </CommuniqueContext.Provider>
  )
}

export const useCommuniques = () => useContext(CommuniqueContext)