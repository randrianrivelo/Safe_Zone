import { useEffect, useState } from 'react'
import './LoadingScreen.css'

export default function LoadingScreen({ isLoading }) {
  const [visible, setVisible] = useState(isLoading)

  useEffect(() => {
    if (isLoading) {
      setVisible(true)
    } else {
      const timer = setTimeout(() => setVisible(false), 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  if (!visible) return null

  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <div className="loading-screen__logo">
          <img src="/logo.png" alt="SafeZone" />
        </div>
        <div className="loading-screen__spinner">
          <div className="loading-screen__spinner-ring" />
          <div className="loading-screen__spinner-ring" />
          <div className="loading-screen__spinner-ring" />
        </div>
        <div className="loading-screen__text">
          <span>SafeZone</span>
          <span>Analamanga 2035</span>
        </div>
        <div className="loading-screen__dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
        <p className="loading-screen__message">
          Chargement de votre espace sécurisé...
        </p>
      </div>
    </div>
  )
}