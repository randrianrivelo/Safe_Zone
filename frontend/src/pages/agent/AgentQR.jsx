import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuthStore } from '../../stores/authStore'
import './AgentQR.css'

export default function AgentQR() {
  const { user } = useAuthStore()
  const [qrData, setQrData] = useState(null)
  const [shelter, setShelter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadShelter()
  }, [])

  const loadShelter = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      let cleanToken = token
      if (cleanToken && cleanToken.startsWith('"') && cleanToken.endsWith('"')) {
        cleanToken = cleanToken.slice(1, -1)
      }

      const res = await fetch('http://localhost:8000/api/agent/shelter', {
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      })

      if (res.ok) {
        const data = await res.json()
        setShelter(data)

        // Générer les données du QR code
        const qrPayload = {
          type: 'shelter_registration',
          version: '1.0',
          shelter_id: data.id,
          shelter_name: data.name,
          shelter_district: data.district,
          agent_id: user?.id,
          agent_name: user?.name,
          timestamp: new Date().toISOString()
        }
        setQrData(JSON.stringify(qrPayload))
      } else if (res.status === 401) {
        // Non autorisé - rediriger vers login
        window.location.href = '/login'
      }
    } catch (err) {
      console.error('Erreur chargement refuge:', err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadQR = () => {
    const canvas = document.querySelector('.qr-code canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `qr_shelter_${shelter?.id}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  if (loading) {
    return (
      <div className="agent-qr">
        <div className="agent-qr__loading">
          <div className="spinner" />
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  if (!shelter) {
    return (
      <div className="agent-qr">
        <div className="agent-qr__error">
          <i className="bi bi-exclamation-triangle-fill" />
          <h2>Aucun refuge assigné</h2>
          <p>Contactez l'administrateur pour vous assigner un refuge.</p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
            Retour au dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-qr">
      <div className="agent-qr__container">
        <div className="agent-qr__header">
          <h1>
            <i className="bi bi-qr-code-scan" />
            QR Code du refuge
          </h1>
          <p>Générez et imprimez ce QR code pour les arrivées des sinistrés</p>
        </div>

        <div className="agent-qr__content">
          {/* QR Code */}
          <div className="agent-qr__qr-section">
            <div className="agent-qr__qr-card">
              <div className="qr-code">
                {qrData && <QRCodeSVG value={qrData} size={280} />}
              </div>
              <div className="agent-qr__qr-actions">
                <button className="btn btn-secondary" onClick={copyToClipboard}>
                  <i className="bi bi-files" />
                  Copier les données
                </button>
                <button className="btn btn-primary" onClick={downloadQR}>
                  <i className="bi bi-download" />
                  Télécharger PNG
                </button>
              </div>
              {copied && (
                <div className="agent-qr__copied">
                  <i className="bi bi-check-circle-fill" />
                  Données copiées !
                </div>
              )}
            </div>
          </div>

          {/* Informations du refuge */}
          <div className="agent-qr__info-section">
            <div className="agent-qr__info-card">
              <h3>
                <i className="bi bi-building" />
                Refuge assigné
              </h3>
              <div className="agent-qr__info-item">
                <span className="label">Nom:</span>
                <span className="value">{shelter.name}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">District:</span>
                <span className="value">{shelter.district || 'Non spécifié'}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">Capacité:</span>
                <span className="value">{shelter.current_occupancy} / {shelter.capacity_total}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">Téléphone:</span>
                <span className="value">{shelter.contact_phone || 'Non spécifié'}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">Adresse:</span>
                <span className="value">{shelter.address || 'Non spécifiée'}</span>
              </div>
            </div>

            <div className="agent-qr__info-card">
              <h3>
                <i className="bi bi-person-badge" />
                Agent responsable
              </h3>
              <div className="agent-qr__info-item">
                <span className="label">Nom:</span>
                <span className="value">{user?.name}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">Email:</span>
                <span className="value">{user?.email}</span>
              </div>
              <div className="agent-qr__info-item">
                <span className="label">Rôle:</span>
                <span className="value value-badge">Agent</span>
              </div>
            </div>

            <div className="agent-qr__instruction-card">
              <h3>
                <i className="bi bi-info-circle" />
                Comment utiliser ce QR code ?
              </h3>
              <ol>
                <li>Imprimez ce QR code ou affichez-le sur un écran</li>
                <li>Les sinistrés scannent le code avec l'application SafeZone</li>
                <li>L'agent saisit le nom de la personne sur son téléphone</li>
                <li>L'enregistrement est automatique dans le système</li>
              </ol>
              <div className="agent-qr__stats">
                <div className="stat">
                  <span className="stat-value">{shelter.current_occupancy}</span>
                  <span className="stat-label">Personnes enregistrées</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{shelter.capacity_total - shelter.current_occupancy}</span>
                  <span className="stat-label">Places restantes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}