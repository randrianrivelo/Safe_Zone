// src/pages/MeteoPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js'
import { METEO_DATA } from '../services/api'
import { useTheme } from '../context/ThemeContext'
import AnimatedCounter from '../components/UI/AnimatedCounter'
import SwipeCard from '../components/UI/SwipeCard'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

const RISK_COLORS = { critical: 'var(--danger)', warning: 'var(--warning)', safe: 'var(--safe)' }
const RISK_BG = { critical: 'rgba(231,76,60,0.1)', warning: 'rgba(243,156,18,0.1)', safe: 'rgba(31,188,52,0.1)' }
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export default function MeteoPage() {
  const [expanded, setExpanded] = useState(null)
  const { currentTheme } = useTheme()
  const chartRefs = useRef({})

  const textColor = currentTheme?.['--text-secondary'] || '#578098'
  const gridColor = currentTheme?.['--border'] || '#87ADC6'

  const getChartOptions = (riskLevel) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: textColor, font: { size: 9 } }, grid: { display: false } },
      y: { ticks: { color: textColor, font: { size: 9 } }, grid: { color: gridColor + '44' } }
    }
  })

  return (
    <div style={{ padding: 24, maxWidth: 1380, margin: '0 auto', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
      <SwipeCard direction="up">
        <h1 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-primary)' }}>
          <i className="bi bi-cloud-sun-fill" style={{ color: 'var(--warning)' }}></i>
          Météo — 6 Provinces de Madagascar
        </h1>
      </SwipeCard>

      {/* Résumé global */}
      <SwipeCard direction="left" delay={100}>
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14,
          padding: '16px 22px', marginBottom: 22, boxShadow: 'var(--shadow)',
          display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-exclamation-octagon-fill" style={{ color: 'var(--danger)', fontSize: '1.3rem' }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>2 provinces en alerte critique</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Antananarivo, Toamasina</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-thermometer-half" style={{ color: 'var(--warning)', fontSize: '1.3rem' }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Moy. <AnimatedCounter end={27} suffix="°C" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Température nationale</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-wind" style={{ color: 'var(--primary)', fontSize: '1.3rem' }}></i>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                Max <AnimatedCounter end={55} suffix=" km/h" />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vent (Toamasina)</div>
            </div>
          </div>
        </div>
      </SwipeCard>

      {/* Grille des provinces */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {METEO_DATA.map((m, i) => (
          <SwipeCard key={i} direction={i % 2 === 0 ? 'left' : 'right'} delay={i * 100}>
            <div
              style={{
                background: 'var(--bg-card)', border: `1px solid var(--border)`,
                borderRadius: 16, padding: 20, boxShadow: 'var(--shadow)',
                cursor: 'pointer', transition: 'all 0.3s',
                borderTop: `3px solid ${RISK_COLORS[m.riskLevel]}`
              }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              {/* En-tête */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: 'var(--safe)', marginRight: 5 }}></i>
                    {m.province}
                  </div>
                </div>
                <i className={`bi ${m.icon}`} style={{ fontSize: '2.2rem', color: RISK_COLORS[m.riskLevel] }}></i>
              </div>

              {/* Température */}
              <div style={{ fontSize: '2.4rem', fontWeight: 900, fontFamily: 'Poppins, sans-serif', color: 'var(--text-primary)', lineHeight: 1, marginBottom: 10 }}>
                <AnimatedCounter end={m.temp} suffix="°C" duration={1000} />
              </div>

              {/* Détails */}
              <div style={{ display: 'flex', gap: 14, fontSize: '0.77rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                <span><i className="bi bi-moisture"></i> {m.humidity}%</span>
                <span><i className="bi bi-wind"></i> {m.wind}km/h</span>
                <span><i className="bi bi-cloud-rain"></i> {m.precip}mm</span>
              </div>

              {/* Alerte */}
              <div style={{
                padding: '7px 11px', borderRadius: 8, fontSize: '0.74rem', fontWeight: 600,
                background: RISK_BG[m.riskLevel], color: RISK_COLORS[m.riskLevel]
              }}>
                <i className={`bi ${m.riskLevel === 'critical' ? 'bi-exclamation-octagon-fill' : m.riskLevel === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}`} style={{ marginRight: 5 }}></i>
                {m.risk}
              </div>

              {/* Graphique (accordéon) */}
              {expanded === i && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: '0.77rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <i className="bi bi-graph-up" style={{ marginRight: 5 }}></i>Prévisions 7 jours
                  </p>
                  <div style={{ height: 140 }}>
                    <Bar
                      data={{
                        labels: DAYS,
                        datasets: [{
                          label: 'Température °C',
                          data: m.forecast,
                          backgroundColor: RISK_COLORS[m.riskLevel] + '88',
                          borderColor: RISK_COLORS[m.riskLevel],
                          borderWidth: 2,
                          borderRadius: 4
                        }]
                      }}
                      options={getChartOptions(m.riskLevel)}
                    />
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: 10, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <i className={`bi ${expanded === i ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                {expanded === i ? ' Masquer' : ' Prévisions 7 jours'}
              </div>
            </div>
          </SwipeCard>
        ))}
      </div>
    </div>
  )
}