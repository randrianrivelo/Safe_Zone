import { useState, useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'
import { useAuthStore } from '../../stores/authStore'
import Navbar from '../../components/layout/Navbar'
import './AdminShelters.css'
import './AdminReports.css'

// Version simplifiée sans appel API users
const getAuthToken = () => {
  let token = localStorage.getItem('token')
  if (!token) return null
  if (token.startsWith('"') && token.endsWith('"')) {
    token = token.slice(1, -1)
  }
  return token
}

export default function AdminReports() {
  const { theme } = useThemeStore()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTab, setFilterTab] = useState('all')
  const [filterType, setFilterType] = useState('')
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [updating, setUpdating] = useState(null)
  const fr = (localStorage.getItem('lang') || 'fr') === 'fr'

  const stats = {
    pending: reports.filter(r => r.status === 'en_attente').length,
    verified: reports.filter(r => r.status === 'verifie').length,
    rejected: reports.filter(r => r.status === 'rejete').length,
    total: reports.length
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    loadReports()
  }, [theme])

  const loadReports = async () => {
    setLoading(true)
    try {
      const token = getAuthToken()
      if (!token) {
        setReports([])
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/reports/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        const reportsArray = Array.isArray(data) ? data : []
        setReports(reportsArray)
      } else {
        setReports([])
      }
    } catch (err) {
      console.error('Erreur chargement signalements:', err)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (id, newStatus) => {
    setUpdating(id)
    try {
      const token = getAuthToken()
      const endpoint = newStatus === 'verifie' ? 'verify' : 'reject'
      const response = await fetch(`http://localhost:8000/api/reports/${id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        await loadReports()
        alert(fr ? `Signalement ${newStatus === 'verifie' ? 'vérifié' : 'rejeté'} !` : `Fampandrenesana ${newStatus === 'verifie' ? 'voamarina' : 'nolavina'} !`)
      } else {
        throw new Error('Erreur')
      }
    } catch (err) {
      console.error('Erreur mise à jour:', err)
      alert(fr ? 'Erreur lors de la mise à jour' : 'Olana tamin\'ny fanavaozana')
    } finally {
      setUpdating(null)
    }
  }

  // Export PDF simplifié (sans jspdf-autotable)
  const handleExportPDF = () => {
    if (reports.length === 0) {
      alert(fr ? 'Aucun signalement à exporter' : 'Tsy misy fampandrenesana hatao export')
      return
    }

    setExporting(true)
    try {
      // Créer le contenu HTML pour l'impression
      const printWindow = window.open('', '_blank')
      const date = new Date().toLocaleString('fr-FR')

      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rapport Signalements SafeZone</title>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            h1 {
              color: #a855f7;
              border-bottom: 2px solid #a855f7;
              padding-bottom: 10px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .stats {
              display: flex;
              gap: 20px;
              margin-bottom: 30px;
              flex-wrap: wrap;
            }
            .stat-card {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 10px;
              text-align: center;
              min-width: 120px;
            }
            .stat-value {
              font-size: 24px;
              font-weight: bold;
            }
            .stat-label {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }
            th {
              background: #a855f7;
              color: white;
            }
            tr:nth-child(even) {
              background: #f9f9f9;
            }
            .status-pending { color: #ffd60a; font-weight: bold; }
            .status-verified { color: #39ff88; font-weight: bold; }
            .status-rejected { color: #ff3b30; font-weight: bold; }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 10px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Smart SafeZone Analamanga 2035</h1>
            <p>Rapport des signalements citoyens</p>
            <p>Généré le : ${date}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${reports.length}</div>
              <div class="stat-label">Total signalements</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #ffd60a;">${stats.pending}</div>
              <div class="stat-label">En attente</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #39ff88;">${stats.verified}</div>
              <div class="stat-label">Vérifiés</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #ff3b30;">${stats.rejected}</div>
              <div class="stat-label">Rejetés</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
      `

      reports.slice(0, 50).forEach(r => {
        const typeLabels = {
          route_endommagee: 'Route endommagée',
          zone_danger: 'Zone dangereuse',
          refuge_plein: 'Refuge saturé',
          inondation: 'Inondation',
          besoin_urgent: 'Besoin urgent',
          alerte_cyclone: 'Alerte cyclone',
          autre: 'Autre'
        }
        const typeLabel = typeLabels[r.report_type] || r.report_type
        const statusClass = r.status === 'en_attente' ? 'status-pending' : (r.status === 'verifie' ? 'status-verified' : 'status-rejected')
        const statusLabel = r.status === 'en_attente' ? 'En attente' : (r.status === 'verifie' ? 'Vérifié' : 'Rejeté')
        const dateStr = new Date(r.created_at).toLocaleDateString('fr-FR')

        htmlContent += `
          <tr>
            <td>#${r.id}</td>
            <td>${typeLabel}</td>
            <td>${(r.description || '—').substring(0, 100)}</td>
            <td class="${statusClass}">${statusLabel}</td>
            <td>${dateStr}</td>
          </tr>
        `
      })

      htmlContent += `
            </tbody>
          </table>
          <div class="footer">
            <p>SafeZone Analamanga 2035 - Document confidentiel</p>
            <p>Page 1/1</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.print()

    } catch (error) {
      console.error('Erreur export:', error)
      alert(fr ? 'Erreur lors de la génération du rapport' : 'Olana tamin\'ny famoronana rapport')
    } finally {
      setExporting(false)
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      route_endommagee: fr ? 'Route endommagée' : 'Lalana simba',
      zone_danger: fr ? 'Zone dangereuse' : 'Toerana mampidi-doza',
      refuge_plein: fr ? 'Refuge saturé' : 'Toerana feno',
      inondation: fr ? 'Inondation' : 'Tondra-drano',
      besoin_urgent: fr ? 'Besoin urgent' : 'Ilaina haingana',
      alerte_cyclone: fr ? 'Alerte cyclone' : 'Fampitandremana rivo-doza',
      autre: fr ? 'Autre' : 'Hafa'
    }
    return labels[type] || type
  }

  const getTypeColor = (type) => {
    const colors = {
      route_endommagee: '#ff9500',
      zone_danger: '#ff3b30',
      refuge_plein: '#ff9500',
      inondation: '#38bdf8',
      besoin_urgent: '#ff3b30',
      alerte_cyclone: '#a855f7'
    }
    return colors[type] || '#94a3b8'
  }

  const getTypeIcon = (type) => {
    const icons = {
      route_endommagee: 'bi-signpost-split',
      zone_danger: 'bi-radioactive',
      refuge_plein: 'bi-building-fill-x',
      inondation: 'bi-water',
      besoin_urgent: 'bi-heart-pulse-fill',
      alerte_cyclone: 'bi-cloud-lightning-rain-fill'
    }
    return icons[type] || 'bi-exclamation-diamond'
  }

  const getStatusLabel = (status) => {
    const labels = {
      en_attente: fr ? 'En attente' : 'Miandry',
      verifie: fr ? 'Vérifié' : 'Voamarina',
      rejete: fr ? 'Rejeté' : 'Nolavina'
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente': return '#ffd60a'
      case 'verifie': return '#39ff88'
      case 'rejete': return '#ff3b30'
      default: return '#94a3b8'
    }
  }

  const filteredReports = reports.filter(r => {
    const matchTab = filterTab === 'all' ? true
      : filterTab === 'pending' ? r.status === 'en_attente'
      : filterTab === 'verified' ? r.status === 'verifie'
      : filterTab === 'rejected' ? r.status === 'rejete'
      : true
    const matchType = !filterType || r.report_type === filterType
    const matchSearch = !search
      || r.description?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchType && matchSearch
  })

  const tabs = [
    { key: 'pending', label: fr ? 'En attente' : 'Miandry', color: '#ffd60a', count: stats.pending, icon: 'bi-hourglass-split' },
    { key: 'verified', label: fr ? 'Vérifiés' : 'Voamarina', color: '#39ff88', count: stats.verified, icon: 'bi-check-circle' },
    { key: 'rejected', label: fr ? 'Rejetés' : 'Nolavina', color: '#ff3b30', count: stats.rejected, icon: 'bi-x-circle' },
    { key: 'all', label: fr ? 'Total' : 'Rehetra', color: 'var(--accent)', count: stats.total, icon: 'bi-list-ul' }
  ]

  const typesList = [
    'route_endommagee', 'zone_danger', 'refuge_plein',
    'inondation', 'besoin_urgent', 'alerte_cyclone', 'autre'
  ]

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="admin-page">
      <Navbar />
      <main className="admin-page__main">
        <div className="admin-page__header">
          <h1><i className="bi bi-flag" /> {fr ? 'Signalements citoyens' : 'Fampandrenesana'}</h1>
          <div className="admin-page__header-actions">
            <button className="admin-page__refresh" onClick={loadReports} disabled={loading}>
              <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`} />
            </button>
            {reports.length > 0 && (
              <button
                className="admin-page__export-btn"
                onClick={handleExportPDF}
                disabled={exporting}
              >
                {exporting ? (
                  <><div className="spinner-sm"></div> {fr ? 'Préparation...' : 'Mamorona...'}</>
                ) : (
                  <><i className="bi bi-printer" /> {fr ? 'Exporter / Imprimer' : 'Avo / Printy'}</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats tabs */}
        <div className="reports__stats">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`reports__stat-card ${filterTab === t.key ? 'active' : ''}`}
              onClick={() => setFilterTab(t.key)}
              style={{ borderColor: filterTab === t.key ? t.color : 'var(--border)' }}
            >
              <i className={t.icon} style={{ color: t.color }} />
              <span className="reports__stat-val" style={{ color: t.color }}>{t.count}</span>
              <span className="reports__stat-label">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Filtres */}
        <div className="reports__filters">
          <div className="admin-page__search">
            <i className="bi bi-search" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={fr ? 'Rechercher par description...' : 'Mitady amin\'ny famaritana...'}
            />
          </div>
          <select className="admin-page__filter" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">{fr ? 'Tous les types' : 'Karazana rehetra'}</option>
            {typesList.map(type => (
              <option key={type} value={type}>{getTypeLabel(type)}</option>
            ))}
          </select>
        </div>

        <p className="reports__count">
          {filteredReports.length} {fr ? 'signalement(s)' : 'fampandrenesana'}
          {filteredReports.length !== reports.length && ` (${reports.length} total)`}
        </p>

        {/* Liste */}
        {loading ? (
          <div className="admin-page__loading"><div className="spinner-lg" /></div>
        ) : filteredReports.length === 0 ? (
          <div className="admin-page__empty">
            <i className="bi bi-inbox" />
            <span>{fr ? 'Aucun signalement' : 'Tsy misy fampandrenesana'}</span>
          </div>
        ) : (
          <div className="reports__list">
            {filteredReports.map((report) => {
              const typeColor = getTypeColor(report.report_type)
              const statusColor = getStatusColor(report.status)

              return (
                <div key={report.id} className="reports__card">
                  <div className="reports__card-header">
                    <div className="reports__card-id">
                      <i className="bi bi-hash" /> #{report.id}
                    </div>
                    <span className="reports__card-type" style={{ background: `${typeColor}15`, color: typeColor }}>
                      <i className={getTypeIcon(report.report_type)} /> {getTypeLabel(report.report_type)}
                    </span>
                    <span className="reports__card-status" style={{ background: `${statusColor}15`, color: statusColor }}>
                      <i className={report.status === 'verifie' ? 'bi-check-circle' : report.status === 'rejete' ? 'bi-x-circle' : 'bi-clock'} />
                      {getStatusLabel(report.status)}
                    </span>
                    <span className="reports__card-date">
                      <i className="bi bi-calendar3" /> {formatDate(report.created_at)}
                    </span>
                  </div>

                  <div className="reports__card-user">
                    <div className="reports__card-avatar">
                      C
                    </div>
                    <div className="reports__card-user-info">
                      <strong>{fr ? 'Citoyen' : 'Olom-pirenena'}</strong>
                      <span><i className="bi bi-person" /> ID: {report.user_id}</span>
                    </div>
                  </div>

                  {report.description && (
                    <div className="reports__card-description">
                      <i className="bi bi-chat-left-text" />
                      <p>{report.description}</p>
                    </div>
                  )}

                  {report.latitude && report.longitude && (
                    <div className="reports__card-location">
                      <i className="bi bi-geo-alt" />
                      <span>{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</span>
                      <button
                        className="reports__map-btn"
                        onClick={() => window.open(`https://www.google.com/maps?q=${report.latitude},${report.longitude}`, '_blank')}
                      >
                        <i className="bi bi-map" /> {fr ? 'Voir sur carte' : 'Hijery sarintany'}
                      </button>
                    </div>
                  )}

                  <div className="reports__card-actions">
                    {report.status === 'en_attente' && (
                      <>
                        <button
                          className="reports__verify-btn"
                          onClick={() => updateReportStatus(report.id, 'verifie')}
                          disabled={updating === report.id}
                        >
                          {updating === report.id ? (
                            <div className="spinner-sm" />
                          ) : (
                            <><i className="bi bi-check-circle" /> {fr ? 'Vérifier' : 'Manamarina'}</>
                          )}
                        </button>
                        <button
                          className="reports__reject-btn"
                          onClick={() => updateReportStatus(report.id, 'reject')}
                          disabled={updating === report.id}
                        >
                          {updating === report.id ? (
                            <div className="spinner-sm" />
                          ) : (
                            <><i className="bi bi-x-circle" /> {fr ? 'Rejeter' : 'Handà'}</>
                          )}
                        </button>
                      </>
                    )}
                    <button
                      className="reports__details-btn"
                      onClick={() => { setSelectedReport(report); setShowDetailsModal(true) }}
                    >
                      <i className="bi bi-eye" /> {fr ? 'Détails' : 'Antsipirihany'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showDetailsModal && selectedReport && (
        <div className="reports__modal" onClick={() => setShowDetailsModal(false)}>
          <div className="reports__modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="reports__modal-header">
              <h3><i className="bi bi-file-text" /> {fr ? 'Détails du signalement' : 'Antsipirihan\'ny fampandrenesana'}</h3>
              <button className="reports__modal-close" onClick={() => setShowDetailsModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>
            <div className="reports__modal-body">
              <div className="reports__modal-field">
                <span className="reports__modal-label">{fr ? 'ID' : 'ID'}</span>
                <span>#{selectedReport.id}</span>
              </div>
              <div className="reports__modal-field">
                <span className="reports__modal-label">{fr ? 'Type' : 'Karazana'}</span>
                <span>{getTypeLabel(selectedReport.report_type)}</span>
              </div>
              <div className="reports__modal-field">
                <span className="reports__modal-label">{fr ? 'Statut' : 'Sata'}</span>
                <span style={{ color: getStatusColor(selectedReport.status) }}>{getStatusLabel(selectedReport.status)}</span>
              </div>
              <div className="reports__modal-field">
                <span className="reports__modal-label">{fr ? 'Date' : 'Daty'}</span>
                <span>{formatDate(selectedReport.created_at)}</span>
              </div>
              <div className="reports__modal-field">
                <span className="reports__modal-label">{fr ? 'Utilisateur ID' : 'ID Mpampiasa'}</span>
                <span>{selectedReport.user_id}</span>
              </div>
              {selectedReport.description && (
                <div className="reports__modal-field reports__modal-field--full">
                  <span className="reports__modal-label">{fr ? 'Description' : 'Famaritana'}</span>
                  <p>{selectedReport.description}</p>
                </div>
              )}
              {selectedReport.latitude && selectedReport.longitude && (
                <div className="reports__modal-field">
                  <span className="reports__modal-label">{fr ? 'Position' : 'Toerana'}</span>
                  <span>{selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}</span>
                </div>
              )}
            </div>
            <div className="reports__modal-actions">
              <button className="reports__modal-btn" onClick={() => setShowDetailsModal(false)}>
                {fr ? 'Fermer' : 'Hidy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}