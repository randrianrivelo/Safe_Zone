export default function RefugeCard({ refuge, isSelected, onSelect, onRoute }) {
  const avail = refuge.capacity - (refuge.current_occupancy || 0)
  const isFull = avail <= 0
  const isLow = avail > 0 && avail < 50
  const percent = Math.round(((refuge.current_occupancy || 0) / refuge.capacity) * 100)

  let statusClass = 'available', statusText = `${avail} places`
  if (isFull) { statusClass = 'full-status'; statusText = 'COMPLET' }
  else if (isLow) { statusClass = 'low'; statusText = `${avail} places` }

  const barColor = percent > 90 ? 'var(--danger)' : percent > 70 ? 'var(--warning)' : 'var(--safe)'

  return (
    <div className={`refuge-card ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`} onClick={() => onSelect(refuge)}>
      <div className="refuge-card-header">
        <div>
          <h3>{refuge.name}</h3>
          <span className="refuge-type-badge"><i className="bi bi-building"></i> {refuge.type}</span>
        </div>
        <span className={`status-badge ${statusClass}`}>{statusText}</span>
      </div>

      {/* Barre de progression */}
      <div className="refuge-progress">
        <div className="refuge-progress-bar" style={{ width: `${percent}%`, background: barColor }}></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>
        <span>{percent}% occupe</span>
        <span>{avail} restantes</span>
      </div>

      <div className="refuge-card-stats">
        <span><i className="bi bi-people-fill"></i> {refuge.current_occupancy || 0}/{refuge.capacity}</span>
        {refuge.distance_km !== undefined && (
          <>
            <span><i className="bi bi-signpost-2-fill"></i> {refuge.distance_km} km</span>
            <span><i className="bi bi-clock-fill"></i> {refuge.estimated_time_minutes} min</span>
          </>
        )}
      </div>

      <div className="refuge-equipment">
        {refuge.has_water && <span className="equip-water"><i className="bi bi-droplet-fill"></i> Eau</span>}
        {refuge.has_electricity && <span className="equip-electric"><i className="bi bi-lightning-fill"></i> Elec</span>}
        {refuge.has_medical && <span className="equip-medical"><i className="bi bi-heart-pulse-fill"></i> Med</span>}
      </div>

      {!isFull && (
        <button className="btn-route" onClick={(e) => { e.stopPropagation(); onRoute(refuge) }}>
          <i className="bi bi-compass-fill"></i> Calculer l'itineraire
        </button>
      )}
    </div>
  )
}