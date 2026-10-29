export default function ComingSoon({ title }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      gap: '16px'
    }}>
      <i className="bi bi-hourglass-split"
         style={{ fontSize: '3rem', color: 'var(--accent)' }} />
      <h2>{title || 'Page en construction'}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>
        SafeZone Analamanga 2035
      </p>
      <a href="/" className="btn btn-primary">
        <i className="bi bi-house" /> Accueil
      </a>
    </div>
  )
}