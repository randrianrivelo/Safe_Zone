import { create } from 'zustand'
import { MAP_CENTER, MAP_ZOOM } from '../utils/constants'

export const useMapStore = create((set) => ({
  center:       MAP_CENTER,
  zoom:         MAP_ZOOM,
  userPosition: null,
  selectedShelter: null,
  currentPath:  [],
  showDangers:  true,
  showShelters: true,
  isLocating:   false,

  setUserPosition: (pos)     => set({ userPosition: pos }),
  setSelectedShelter: (s)    => set({ selectedShelter: s }),
  setCurrentPath: (path)     => set({ currentPath: path }),
  toggleDangers: ()          => set((s) => ({ showDangers: !s.showDangers })),
  toggleShelters: ()         => set((s) => ({ showShelters: !s.showShelters })),
  setLocating: (v)           => set({ isLocating: v }),
  clearPath: ()              => set({ currentPath: [], selectedShelter: null })
}))