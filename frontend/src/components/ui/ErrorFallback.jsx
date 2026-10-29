import React from 'react'

export default function ErrorFallback({ error }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      textAlign: 'center',
      padding: '20px'
    }}>
      <div>
        <h1 style={{ marginBottom: '16px' }}>⚠️ Oups, quelque chose s'est mal passé</h1>
        <p style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
          {error?.message || 'Une erreur inconnue s\'est produite'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Recharger la page
        </button>
      </div>
    </div>
  )
}
