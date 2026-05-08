import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'

export default function ThemeToggle() {
  const { themes, theme, cycleTheme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 16,
        zIndex: 2002,
        fontFamily: 'var(--font-body)',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'var(--bg-glass, rgba(255,255,255,0.65))',
          border: '1px solid var(--border-glass, rgba(135,173,198,0.8))',
          color: 'var(--text-primary, #203038)',
          borderRadius: 12,
          padding: '8px 10px',
          cursor: 'pointer',
          backdropFilter: 'blur(20px)',
          boxShadow: 'var(--shadow, 0 8px 32px rgba(0,0,0,0.15))',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 700,
          userSelect: 'none',
        }}
      >
        <i className={`bi ${themes?.[theme]?.icon || 'bi-sun-fill'}`} />
        <span style={{ fontSize: '0.8rem' }}>Thème</span>
      </button>

      {open && (
        <div
          style={{
            marginTop: 10,
            background: 'var(--bg-glass, rgba(255,255,255,0.75))',
            border: '1px solid var(--border-glass, rgba(135,173,198,0.8))',
            borderRadius: 12,
            padding: 8,
            backdropFilter: 'blur(20px)',
            minWidth: 170,
          }}
        >
          {Object.entries(themes || {}).map(([k, t]) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setOpen(false)
                cycleTheme()
              }}
              style={{
                width: '100%',
                textAlign: 'left',
                background: 'transparent',
                border: 0,
                padding: '8px 10px',
                cursor: 'pointer',
                color: 'var(--text-primary, #203038)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                borderRadius: 10,
              }}
              title={t?.name}
            >
              <i className={`bi ${t.icon}`} />
              <span style={{ fontSize: '0.85rem' }}>{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

