import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import './QRScanner.css'

export default function QRScanner({ onScanSuccess, onClose }) {
  const [scanning, setScanning] = useState(true)
  const scannerRef = useRef(null)
  const containerId = useRef(`qr-reader-${Date.now()}`)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(containerId.current, {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true
    })

    scanner.render(
      (decodedText) => {
        scanner.clear()
        setScanning(false)
        onScanSuccess(decodedText)
      },
      (error) => {
        // Ignorer les erreurs de scan normales
        if (error && !error.includes('No MultiFormat Readers')) {
          console.warn('Scan error:', error)
        }
      }
    )

    scannerRef.current = scanner

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [onScanSuccess])

  return (
    <div className="qr-scanner-modal">
      <div className="qr-scanner-content">
        <button className="qr-scanner-close" onClick={onClose}>
          <i className="bi bi-x-lg" />
        </button>
        <h3>Scanner un QR code</h3>
        <div id={containerId.current} style={{ width: '100%' }} />
        {!scanning && (
          <div className="qr-scanner-success">
            <i className="bi bi-check-circle-fill" />
            <span>Code scanné avec succès !</span>
          </div>
        )}
      </div>
    </div>
  )
}