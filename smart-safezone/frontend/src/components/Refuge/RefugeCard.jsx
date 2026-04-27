// src/components/Refuge/RefugeCard.jsx

export default function RefugeCard({ refuge, isSelected, onSelect, onRoute }) {
    const available = refuge.capacity - (refuge.current_occupancy || 0)
    const isFull = available <= 0
    const isLow = available > 0 && available < 50
  
    let statusClass = 'available'
    let statusText = `${available} places`
    if (isFull) {
      statusClass = 'full-badge'
      statusText = 'COMPLET'
    } else if (isLow) {
      statusClass = 'low'
      statusText = `${available} places`
    }
  
    return (
      <div
        className={`refuge-card ${isSelected ? 'selected' : ''} ${isFull ? 'full' : ''}`}
        onClick={() => onSelect(refuge)}
      >
        {/* En-tête */}
        <div className="refuge-card-header">
          <div>
            <h3>{refuge.name}</h3>
            <span className="refuge-type-badge">
              <i className="bi bi-building me-1"></i>
              {refuge.type}
            </span>
          </div>
          <span className={`refuge-status-badge ${statusClass}`}>{statusText}</span>
        </div>
  
        {/* Stats */}
        <div className="refuge-card-stats">
          <span>
            <i className="bi bi-people-fill"></i>
            {refuge.current_occupancy || 0}/{refuge.capacity}
          </span>
          {refuge.distance_km !== undefined && (
            <>
              <span>
                <i className="bi bi-signpost-2-fill"></i>
                {refuge.distance_km} km
              </span>
              <span>
                <i className="bi bi-clock-fill"></i>
                {refuge.estimated_time_minutes} min
              </span>
            </>
          )}
        </div>
  
        {/* Équipements */}
        <div className="refuge-equipment">
          {refuge.has_water && (
            <span className="equip-water">
              <i className="bi bi-droplet-fill"></i> Eau
            </span>
          )}
          {refuge.has_electricity && (
            <span className="equip-electric">
              <i className="bi bi-lightning-fill"></i> Élec
            </span>
          )}
          {refuge.has_medical && (
            <span className="equip-medical">
              <i className="bi bi-heart-pulse-fill"></i> Médical
            </span>
          )}
        </div>
  
        {/* Bouton itinéraire */}
        {!isFull && (
          <button
            className="btn btn-route"
            onClick={(e) => {
              e.stopPropagation()
              onRoute(refuge)
            }}
          >
            <i className="bi bi-compass-fill"></i>
            Calculer l'itinéraire
          </button>
        )}
      </div>
    )
  }