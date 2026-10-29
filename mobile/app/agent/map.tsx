import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native'
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useThemeStore } from '../../src/stores/themeStore'
import ThemeToggle from '../../src/components/ThemeToggle'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  calculateShelterScore,
  haversineDistance
} from '../../src/algorithms/pathfinding'
import { getOSRMTrace, walkingTime } from '../../src/algorithms/osrmRouting'

const { width, height } = Dimensions.get('window')

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
]

interface Shelter {
  id: number
  name: string
  latitude: number
  longitude: number
  current_occupancy: number
  capacity_total: number
  status: string
  district: string
  has_water?: boolean
  has_medical?: boolean
  has_electricity?: boolean
  has_food?: boolean
}

export default function MapScreen() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const mapRef = useRef<MapView>(null)

  const [shelters, setShelters] = useState<Shelter[]>([])
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null)
  const [route, setRoute] = useState<{ latitude: number; longitude: number }[]>([])
  const [routeInfo, setRouteInfo] = useState<{ distance: number; time: number } | null>(null)
  const [mode, setMode] = useState<'normal' | 'urgence'>('normal')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadShelters()
    getUserLocation()
  }, [])

  const loadShelters = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/shelters/`)
      const data = await response.json()
      const sheltersData = Array.isArray(data) ? data : []
      setShelters(sheltersData)
      console.log(`✅ ${sheltersData.length} refuges chargés`)
    } catch (error: any) {
      console.error('Erreur:', error.message)
      Alert.alert('Erreur', 'Impossible de charger les refuges')
    } finally {
      setLoading(false)
    }
  }

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission de localisation refusée')
      setUserLocation({ latitude: -18.9137, longitude: 47.5361 })
      return
    }
    try {
      const location = await Location.getCurrentPositionAsync()
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (error) {
      setUserLocation({ latitude: -18.9137, longitude: 47.5361 })
    }
  }

  // ========== ALGORITHME A* pour trouver le MEILLEUR refuge ==========
  const findBestShelter = async () => {
    if (!userLocation) {
      Alert.alert('Erreur', 'Position non disponible')
      return
    }

    setCalculating(true)
    setSelectedShelter(null)
    setRoute([])
    setRouteInfo(null)

    try {
      // 1. Calculer le score de chaque refuge avec A* (pondéré)
      const sheltersWithScore = shelters.map(shelter => {
        const { score, distance } = calculateShelterScore(
          shelter,
          userLocation.latitude,
          userLocation.longitude
        )
        return { ...shelter, score, distance }
      })

      // 2. Trier par score (plus haut = meilleur)
      const sorted = sheltersWithScore.sort((a, b) => {
        if (mode === 'urgence') {
          // En urgence, priorité à la distance
          return a.distance - b.distance
        }
        // Normal, priorité au score
        return b.score - a.score
      })

      const bestShelter = sorted[0]

      if (!bestShelter) {
        Alert.alert('Info', 'Aucun refuge trouvé')
        setCalculating(false)
        return
      }

      console.log(`🏆 Meilleur refuge: ${bestShelter.name} (score: ${bestShelter.score}, distance: ${bestShelter.distance}km)`)

      setSelectedShelter(bestShelter)

      // 3. Obtenir le tracé réel OSRM pour l'affichage
      const trace = await getOSRMTrace(
        userLocation.latitude, userLocation.longitude,
        bestShelter.latitude, bestShelter.longitude
      )

      if (trace && trace.coordinates.length > 0) {
        const routeCoords = trace.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon
        }))
        setRoute(routeCoords)
        setRouteInfo({
          distance: Math.round(trace.distance / 1000 * 10) / 10,
          time: walkingTime(trace.distance)
        })

        // Centrer la carte
        if (mapRef.current && routeCoords.length > 0) {
          const midIndex = Math.floor(routeCoords.length / 2)
          mapRef.current.animateToRegion({
            latitude: routeCoords[midIndex].latitude,
            longitude: routeCoords[midIndex].longitude,
            latitudeDelta: Math.abs(userLocation.latitude - bestShelter.latitude) * 1.5,
            longitudeDelta: Math.abs(userLocation.longitude - bestShelter.longitude) * 1.5,
          }, 1000)
        }
      } else {
        // Fallback: ligne droite
        const routeCoords = [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: bestShelter.latitude, longitude: bestShelter.longitude }
        ]
        setRoute(routeCoords)
        setRouteInfo({
          distance: bestShelter.distance,
          time: Math.round((bestShelter.distance / 5) * 60)
        })
      }

      // 4. Sauvegarder dans l'historique
      await saveToHistory(bestShelter.name, bestShelter.id, bestShelter.distance)

    } catch (error) {
      console.error('Erreur:', error)
      Alert.alert('Erreur', 'Impossible de calculer l\'itinéraire')
    } finally {
      setCalculating(false)
    }
  }

  // Aller vers un refuge spécifique
  const goToShelter = async (shelter: Shelter) => {
    if (!userLocation) return

    setCalculating(true)
    try {
      const trace = await getOSRMTrace(
        userLocation.latitude, userLocation.longitude,
        shelter.latitude, shelter.longitude
      )

      if (trace && trace.coordinates.length > 0) {
        const routeCoords = trace.coordinates.map(([lon, lat]) => ({
          latitude: lat,
          longitude: lon
        }))
        setRoute(routeCoords)
        setRouteInfo({
          distance: Math.round(trace.distance / 1000 * 10) / 10,
          time: walkingTime(trace.distance)
        })
        setSelectedShelter(shelter)

        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: shelter.latitude,
            longitude: shelter.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000)
        }
      } else {
        const distance = haversineDistance(
          userLocation.latitude, userLocation.longitude,
          shelter.latitude, shelter.longitude
        )
        const routeCoords = [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: shelter.latitude, longitude: shelter.longitude }
        ]
        setRoute(routeCoords)
        setRouteInfo({
          distance: Math.round(distance * 10) / 10,
          time: Math.round((distance / 5) * 60)
        })
        setSelectedShelter(shelter)
      }
    } finally {
      setCalculating(false)
    }
  }

  const saveToHistory = async (shelterName: string, shelterId: number, distanceKm: number) => {
    try {
      const savedRoutes = await AsyncStorage.getItem('route_history')
      const routes = savedRoutes ? JSON.parse(savedRoutes) : []
      routes.unshift({
        shelter_name: shelterName,
        shelter_id: shelterId,
        distance_km: Math.round(distanceKm * 10) / 10,
        duration_min: Math.round((distanceKm / 5) * 60),
        timestamp: new Date().toISOString()
      })
      if (routes.length > 20) routes.pop()
      await AsyncStorage.setItem('route_history', JSON.stringify(routes))
    } catch (e) {}
  }

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500)
    }
  }

  const clearRoute = () => {
    setRoute([])
    setRouteInfo(null)
    setSelectedShelter(null)
  }

  const getMarkerColor = (shelter: Shelter) => {
    const pct = shelter.capacity_total ? (shelter.current_occupancy / shelter.capacity_total) * 100 : 0
    if (pct >= 90) return '#ff3b30'
    if (pct >= 50) return '#ff9500'
    return '#39ff88'
  }

  const getRouteColor = () => mode === 'urgence' ? '#39ff88' : '#a855f7'

  const filteredShelters = shelters.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <ActivityIndicator size="large" color="#a855f7" />
        <Text style={styles.loadingText}>Chargement des refuges...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={[styles.header, { backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#ffffff' : '#1a2c3e' }]}
            placeholder="Rechercher un refuge..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <ThemeToggle />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          showsUserLocation={true}
          showsMyLocationButton={true}
          customMapStyle={isDark ? darkMapStyle : []}
          initialRegion={{
            latitude: userLocation?.latitude || -18.9137,
            longitude: userLocation?.longitude || 47.5361,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {filteredShelters.map((shelter) => (
            <Marker
              key={shelter.id}
              coordinate={{ latitude: shelter.latitude, longitude: shelter.longitude }}
              title={shelter.name}
              description={`${shelter.current_occupancy}/${shelter.capacity_total} places`}
              onPress={() => setSelectedShelter(shelter)}
            >
              <View style={[styles.marker, { backgroundColor: getMarkerColor(shelter) }]} />
            </Marker>
          ))}

          {route.length > 0 && (
            <Polyline
              coordinates={route}
              strokeColor={getRouteColor()}
              strokeWidth={4}
              lineDashPattern={mode === 'urgence' ? [10, 10] : undefined}
            />
          )}
        </MapView>

        {/* Boutons */}
        <TouchableOpacity style={[styles.controlButton, { bottom: 20, right: 20 }]} onPress={centerOnUser}>
          <Ionicons name="locate" size={24} color="#a855f7" />
        </TouchableOpacity>

        <View style={[styles.modeToggle, { backgroundColor: isDark ? '#0b1023' : '#ffffff' }]}>
          <TouchableOpacity style={[styles.modeButton, mode === 'normal' && styles.modeButtonActive]} onPress={() => setMode('normal')}>
            <Text style={[styles.modeButtonText, mode === 'normal' && { color: '#a855f7' }]}>Normal</Text>
            <Text style={styles.modeAlgo}>A* score</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.modeButton, mode === 'urgence' && styles.modeButtonActiveUrgence]} onPress={() => setMode('urgence')}>
            <Text style={[styles.modeButtonText, mode === 'urgence' && { color: '#39ff88' }]}>Urgence</Text>
            <Text style={styles.modeAlgo}>Distance</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.findButton, { backgroundColor: mode === 'urgence' ? '#39ff88' : '#a855f7' }]}
          onPress={findBestShelter}
          disabled={calculating}
        >
          {calculating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons name="compass-outline" size={20} color="#ffffff" />
              <Text style={styles.findButtonText}>Trouver le meilleur refuge</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Panneau d'info */}
        {selectedShelter && routeInfo && (
          <View style={[styles.infoPanel, { backgroundColor: isDark ? '#0b1023' : '#ffffff' }]}>
            <TouchableOpacity style={styles.infoClose} onPress={clearRoute}>
              <Ionicons name="close" size={20} color={isDark ? '#ffffff' : '#1a2c3e'} />
            </TouchableOpacity>

            <Text style={[styles.infoName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{selectedShelter.name}</Text>
            <Text style={[styles.infoDistrict, { color: isDark ? '#94a3b8' : '#64748b' }]}>{selectedShelter.district}</Text>

            <View style={styles.infoRow}>
              <Ionicons name="navigate-outline" size={16} color={getRouteColor()} />
              <Text style={[styles.infoText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{routeInfo.distance} km • {routeInfo.time} min</Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={16} color={getMarkerColor(selectedShelter)} />
              <Text style={[styles.infoText, { color: getMarkerColor(selectedShelter) }]}>
                {selectedShelter.current_occupancy}/{selectedShelter.capacity_total} places
              </Text>
            </View>

            <TouchableOpacity style={[styles.infoButton, { backgroundColor: getRouteColor() }]} onPress={() => goToShelter(selectedShelter)}>
              <Ionicons name="map-outline" size={18} color="#ffffff" />
              <Text style={styles.infoButtonText}>Voir l'itinéraire</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#94a3b8' },

  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },

  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },

  marker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  controlButton: {
    position: 'absolute',
    padding: 12,
    borderRadius: 30,
    backgroundColor: '#0b1023',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },

  modeToggle: {
    position: 'absolute',
    top: 110,
    right: 16,
    flexDirection: 'row',
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  modeButton: { paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' },
  modeButtonActive: { backgroundColor: 'rgba(168,85,247,0.2)' },
  modeButtonActiveUrgence: { backgroundColor: 'rgba(57,255,136,0.2)' },
  modeButtonText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },
  modeAlgo: { fontSize: 9, color: '#64748b', marginTop: 2 },

  findButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  findButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },

  infoPanel: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  infoClose: { position: 'absolute', top: 12, right: 12, padding: 4, zIndex: 1 },
  infoName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, paddingRight: 30 },
  infoDistrict: { fontSize: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 13 },
  infoButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10, marginTop: 8 },
  infoButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
})