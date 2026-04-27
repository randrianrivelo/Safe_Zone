// src/hooks/useGeolocation.js
import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Position par défaut : Analakely, Antananarivo
    const defaultPosition = {
      latitude: -18.9100,
      longitude: 47.5255
    }

    if (!navigator.geolocation) {
      setError("Géolocalisation non supportée")
      setPosition(defaultPosition)
      setLoading(false)
      return
    }

    const onSuccess = (pos) => {
      setPosition({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
      setLoading(false)
    }

    const onError = () => {
      setError("Position non disponible")
      setPosition(defaultPosition)
      setLoading(false)
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000
    })

    const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true
    })

    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  return { position, error, loading }
}