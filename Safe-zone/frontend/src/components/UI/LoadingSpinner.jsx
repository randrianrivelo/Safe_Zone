export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="loading-spinner">🌀</div>
        <h5 style={{ fontWeight: 700, marginBottom: 4 }}>{message}</h5>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          Analyse des routes en cours
        </p>
      </div>
    </div>
  )
}