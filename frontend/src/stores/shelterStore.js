import { create } from 'zustand'
import { shelterService } from '../services/shelterService'

export const useShelterStore = create((set) => ({
  shelters:   [],
  loading:    false,
  filter:     { status: '', district_id: '' },
  searchTerm: '',

  fetchShelters: async () => {
    set({ loading: true })
    try {
      const data = await shelterService.getAll()
      set({ shelters: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  setFilter:     (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
  setSearchTerm: (t) => set({ searchTerm: t }),

  getFiltered: (shelters, filter, searchTerm) => {
    return shelters.filter((s) => {
      const matchStatus = !filter.status || s.status === filter.status
      const matchSearch = !searchTerm ||
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchStatus && matchSearch
    })
  }
}))