import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const defaultPos = { latitude: -18.9100, longitude: 47.5255 }

    if (!navigator.geolocation) {
      setPosition(defaultPos)
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setLoading(false)
      },
      () => {
        setPosition(defaultPos)
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )

    const wid = navigator.geolocation.watchPosition(
      (pos) => setPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(wid)
  }, [])

  return { position, error, loading }
}