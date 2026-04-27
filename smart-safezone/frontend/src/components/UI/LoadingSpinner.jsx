// src/components/UI/LoadingSpinner.jsx

export default function LoadingSpinner({ message = 'Chargement...' }) {
    return (
      <div className="loading-overlay">
        <div className="loading-card">
          <div className="loading-spinner">🌀</div>
          <h5 className="fw-bold mb-1">{message}</h5>
          <p className="text-muted small mb-0">Analyse des routes sûres en cours</p>
        </div>
      </div>
    )
  }