import { useState } from 'react'

export default function SearchFilter({ onSearch, onFilter }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ water: false, electricity: false, medical: false })

  const handleSearch = (val) => {
    setQuery(val)
    onSearch(val)
  }

  const toggleFilter = (key) => {
    const updated = { ...filters, [key]: !filters[key] }
    setFilters(updated)
    onFilter(updated)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="input-group-icon" style={{ marginBottom: 10 }}>
        <i className="bi bi-search"></i>
        <input className="login-input" style={{ marginBottom: 0 }} type="text"
          placeholder="Rechercher un refuge..." value={query}
          onChange={(e) => handleSearch(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button className={`btn-filter ${filters.water ? 'active' : ''}`}
          onClick={() => toggleFilter('water')}>
          <i className="bi bi-droplet-fill"></i> Eau
        </button>
        <button className={`btn-filter ${filters.electricity ? 'active' : ''}`}
          onClick={() => toggleFilter('electricity')}>
          <i className="bi bi-lightning-fill"></i> Elec
        </button>
        <button className={`btn-filter ${filters.medical ? 'active' : ''}`}
          onClick={() => toggleFilter('medical')}>
          <i className="bi bi-heart-pulse-fill"></i> Med
        </button>
      </div>
    </div>
  )
}