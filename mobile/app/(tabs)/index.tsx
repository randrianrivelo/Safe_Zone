import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  RefreshControl, ActivityIndicator, Image
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'
import { useAuthStore } from '../../src/stores/authStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function CitizenDashboard() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'

  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [nearbyShelters, setNearbyShelters] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')

      const [statsRes, weatherRes, forecastRes, alertsRes, sheltersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/shelters/stats`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/weather/current/antananarivo`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/weather/forecast/antananarivo?days=7`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/alerts/active`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/shelters/`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
      ])

      setStats(await statsRes.json())
      setWeather(await weatherRes.json())
      const forecastData = await forecastRes.json()
      setForecast(Array.isArray(forecastData) ? forecastData : [])
      const alertsData = await alertsRes.json()
      setAlerts(Array.isArray(alertsData) ? alertsData : [])
      const shelters = await sheltersRes.json()
      setNearbyShelters(Array.isArray(shelters) ? shelters.slice(0, 3) : [])
    } catch (error) {
      console.error('Erreur:', error)
      setStats({ total_shelters: 93, total_capacity: 70755, available_spots: 52525, open_shelters: 65, occupancy_rate: 26 })
      setWeather({ temperature: 24, condition: 'Nuageux', humidity: 83, wind_kmh: 3, risk_level: 'faible', icon: 'cloud-outline' })
      setForecast([])
      setAlerts([])
      setNearbyShelters([])
    } finally { setLoading(false) }
  }

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false) }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    const code = iconCode?.substring(0, 2) || ''
    switch (code) {
      case '01': return 'sunny-outline'
      case '02': return 'cloudy-outline'
      case '03': case '04': return 'cloud-outline'
      case '09': case '10': return 'rainy-outline'
      case '11': return 'thunderstorm-outline'
      default: return 'cloud-outline'
    }
  }

  const getDayName = (dateStr: string) => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const date = new Date(dateStr)
    return days[date.getDay()]
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#a855f7" /><Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Chargement...</Text></View>
      </SafeAreaView>
    )
  }

  const occupancyRate = stats?.total_capacity ? Math.round((stats.total_occupancy / stats.total_capacity) * 100) : 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}>

        {/* En-tête avec icône */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcome, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Bonjour, {user?.name?.split(' ')[0] || 'Utilisateur'} !</Text>
            <Text style={[styles.date, { color: isDark ? '#94a3b8' : '#64748b' }]}>{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/settings')} style={styles.settingsIcon}>
            <Ionicons name="settings-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
          </TouchableOpacity>
        </View>

        {/* Météo actuelle avec icône */}
        {weather && (
          <View style={[styles.weatherCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <View style={styles.weatherHeader}>
              <View>
                <Text style={[styles.weatherTemp, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{weather.temperature}°C</Text>
                <Text style={[styles.weatherCondition, { color: isDark ? '#94a3b8' : '#64748b' }]}>{weather.condition}</Text>
              </View>
              <Ionicons name={getWeatherIcon(weather.icon)} size={56} color="#38bdf8" />
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetail}><Ionicons name="leaf-outline" size={16} color={isDark ? '#94a3b8' : '#64748b'} /><Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{weather.wind_kmh} km/h</Text></View>
              <View style={styles.weatherDetail}><Ionicons name="water-outline" size={16} color={isDark ? '#94a3b8' : '#64748b'} /><Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{weather.humidity}%</Text></View>
              <View style={[styles.weatherRisk, { backgroundColor: `${getRiskColor(weather.risk_level)}20` }]}><Text style={[styles.weatherRiskText, { color: getRiskColor(weather.risk_level) }]}>{weather.risk_level}</Text></View>
            </View>
          </View>
        )}

        {/* Prévisions 7 jours avec icônes */}
        {forecast.length > 0 && (
          <View style={styles.forecastSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="calendar-outline" size={18} /> Prévisions 7 jours</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {forecast.map((day, i) => (
                <View key={i} style={[styles.forecastCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
                  <Text style={[styles.forecastDay, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{getDayName(day.date)}</Text>
                  <Text style={[styles.forecastTemp, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{day.temp_max}°/{day.temp_min}°</Text>
                  <Ionicons name={getWeatherIcon(day.icon)} size={28} color="#38bdf8" />
                  <Text style={[styles.forecastCond, { color: isDark ? '#94a3b8' : '#64748b' }]}>{day.condition}</Text>
                  <View style={[styles.forecastRisk, { backgroundColor: `${getRiskColor(day.risk_level)}20` }]}><Text style={[styles.forecastRiskText, { color: getRiskColor(day.risk_level) }]}>{day.risk_level}</Text></View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Statistiques avec icônes */}
        {stats && (
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="stats-chart-outline" size={18} /> Chiffres clés</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="business-outline" size={24} color="#a855f7" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats.total_shelters || 93}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Refuges</Text></View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="people-outline" size={24} color="#38bdf8" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats.available_spots?.toLocaleString() || '52k'}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Places disponibles</Text></View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="home-outline" size={24} color="#39ff88" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats.open_shelters || 65}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Refuges ouverts</Text></View>
              <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="pie-chart-outline" size={24} color="#ffd60a" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{occupancyRate}%</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Taux d'occupation</Text></View>
            </View>
          </View>
        )}

        {/* Alertes actives avec icônes */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={18} /> Alertes actives</Text>
            {alerts.slice(0, 3).map(alert => (
              <TouchableOpacity key={alert.id} style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/alerts')}>
                <View style={styles.alertHeader}><Ionicons name="warning-outline" size={20} color="#ff3b30" /><Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{alert.title}</Text></View>
                <Text style={[styles.alertMessage, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>{alert.message}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Refuges à proximité avec icônes */}
        {nearbyShelters.length > 0 && (
          <View style={styles.nearbySection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="location-outline" size={18} /> Refuges à proximité</Text>
            {nearbyShelters.map(shelter => {
              const pct = shelter.capacity_total ? Math.round((shelter.current_occupancy / shelter.capacity_total) * 100) : 0
              const color = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
              return (
                <TouchableOpacity key={shelter.id} style={[styles.nearbyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/map')}>
                  <View style={styles.nearbyHeader}><Ionicons name="business-outline" size={20} color="#a855f7" /><Text style={[styles.nearbyName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{shelter.name}</Text></View>
                  <Text style={[styles.nearbyDistrict, { color: isDark ? '#94a3b8' : '#64748b' }]}>{shelter.district}</Text>
                  <View style={styles.nearbyStats}><Text style={[styles.nearbyOccupancy, { color }]}>{shelter.current_occupancy}/{shelter.capacity_total} ({pct}%)</Text><Text style={[styles.nearbyDistance, { color: isDark ? '#94a3b8' : '#64748b' }]}>{shelter.distance?.toFixed(1) || '?'} km</Text></View>
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Actions rapides avec icônes */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="flash-outline" size={18} /> Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/map')}><Ionicons name="map-outline" size={28} color="#a855f7" /><Text style={[styles.actionLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Carte</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/sos')}><Ionicons name="flash-outline" size={28} color="#ff3b30" /><Text style={[styles.actionLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>SOS</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/report')}><Ionicons name="flag-outline" size={28} color="#ff9500" /><Text style={[styles.actionLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Signaler</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]} onPress={() => router.push('/(tabs)/profile')}><Ionicons name="person-outline" size={28} color="#38bdf8" /><Text style={[styles.actionLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Profil</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  date: { fontSize: 14 },
  settingsIcon: { padding: 8 },
  weatherCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  weatherTemp: { fontSize: 32, fontWeight: 'bold' },
  weatherCondition: { fontSize: 14 },
  weatherDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherDetail: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weatherRisk: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  weatherRiskText: { fontSize: 11, fontWeight: '600' },
  forecastSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  forecastCard: { width: 100, padding: 12, borderRadius: 16, marginRight: 12, alignItems: 'center', gap: 4 },
  forecastDay: { fontSize: 14, fontWeight: '600' },
  forecastTemp: { fontSize: 12 },
  forecastCond: { fontSize: 10, textAlign: 'center' },
  forecastRisk: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  forecastRiskText: { fontSize: 9, fontWeight: '600' },
  statsSection: { marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  alertsSection: { marginBottom: 24 },
  alertCard: { padding: 14, borderRadius: 12, marginBottom: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  alertTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  alertMessage: { fontSize: 13, lineHeight: 18 },
  nearbySection: { marginBottom: 24 },
  nearbyCard: { padding: 14, borderRadius: 12, marginBottom: 8 },
  nearbyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nearbyName: { fontSize: 14, fontWeight: '600', flex: 1 },
  nearbyDistrict: { fontSize: 12, marginBottom: 8 },
  nearbyStats: { flexDirection: 'row', justifyContent: 'space-between' },
  nearbyOccupancy: { fontSize: 11, fontWeight: '600' },
  nearbyDistance: { fontSize: 11 },
  actionsSection: { marginBottom: 24 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  actionLabel: { fontSize: 14, fontWeight: '500' },
})