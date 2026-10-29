import { useState, useCallback } from 'react'
import { useMapStore } from '../stores/mapStore'

export const useGeolocation = () => {
  const [error, setError] = useState(null)
  const { setUserPosition, setLocating } = useMapStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée')
      return
    }

    setLocating(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition([
          position.coords.latitude,
          position.coords.longitude
        ])
        setLocating(false)
      },
      () => {
        // Position par défaut : Antananarivo
        setUserPosition([-18.9137, 47.5361])
        setError('Position par défaut utilisée')
        setLocating(false)
      },
      {
        timeout: 10000,
        enableHighAccuracy: true,
        maximumAge: 0
      }
    )
  }, [setUserPosition, setLocating])


  return { locate, error }
}