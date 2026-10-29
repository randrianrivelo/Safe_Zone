import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'
import { useAuthStore } from '../../src/stores/authStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AdminDashboard() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const isDark = theme === 'dark'
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')

      const [statsRes, weatherRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/weather/current/antananarivo`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/alerts/active`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
      ])

      setStats(await statsRes.json())
      setWeather(await weatherRes.json())
      const alertsData = await alertsRes.json()
      setAlerts(Array.isArray(alertsData) ? alertsData : [])
    } catch (error) {
      console.error('Erreur:', error)
      setStats({ total_shelters: 93, total_capacity: 70755, open_shelters: 65, active_alerts: 3, pending_reports: 2, blocked_roads: 5, active_dangers: 6 })
      setWeather({ temperature: 24, condition: 'Nuageux', humidity: 83, wind_kmh: 3, risk_level: 'faible' })
    } finally { setLoading(false) }
  }

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false) }
  const handleLogout = () => { Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Déconnexion', onPress: () => logout() }]) }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }


  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#a855f7" /></View></SafeAreaView>

  const occupancyRate = stats?.total_capacity ? Math.round((stats.total_occupancy / stats.total_capacity) * 100) : 0

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="speedometer-outline" size={24} /> Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}><Ionicons name="log-out-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}>

        {/* Météo */}
        {weather && (
          <View style={[styles.weatherCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <View style={styles.weatherHeader}>
              <View><Text style={[styles.weatherTemp, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{weather.temperature}°C</Text><Text style={[styles.weatherCondition, { color: isDark ? '#94a3b8' : '#64748b' }]}>{weather.condition}</Text></View>
              <Ionicons name="cloud-outline" size={48} color="#38bdf8" />
            </View>
            <View style={styles.weatherDetails}>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>💨 {weather.wind_kmh} km/h</Text>
              <Text style={{ color: isDark ? '#94a3b8' : '#64748b' }}>💧 {weather.humidity}%</Text>
              <View style={[styles.weatherRisk, { backgroundColor: `${getRiskColor(weather.risk_level)}20` }]}><Text style={{ color: getRiskColor(weather.risk_level) }}>{weather.risk_level}</Text></View>
            </View>
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="business-outline" size={24} color="#a855f7" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.total_shelters || 93}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Refuges</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="people-outline" size={24} color="#38bdf8" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.total_capacity?.toLocaleString() || '70k'}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Capacité</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="home-outline" size={24} color="#39ff88" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.open_shelters || 65}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Refuges ouverts</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="pie-chart-outline" size={24} color="#ffd60a" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{occupancyRate}%</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Occupation</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="alert-circle-outline" size={24} color="#ff9500" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.active_alerts || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Alertes</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="flag-outline" size={24} color="#ff3b30" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.pending_reports || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Signalements</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="close-circle-outline" size={24} color="#ffd60a" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.blocked_roads || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Routes bloquées</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="warning-outline" size={24} color="#ff3b30" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.active_dangers || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Zones dangereuses</Text></View>
        </View>

        {/* Alertes actives */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={18} /> Alertes actives</Text>
            {alerts.slice(0, 3).map(alert => (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
                <View style={styles.alertHeader}><Ionicons name="warning-outline" size={20} color="#ff3b30" /><Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{alert.title}</Text></View>
                <Text style={[styles.alertMessage, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions rapides */}
        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="flash-outline" size={18} /> Actions rapides</Text>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/shelters')}><Ionicons name="business-outline" size={22} color="#a855f7" /><Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Gérer les refuges</Text><Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/alerts')}><Ionicons name="alert-circle-outline" size={22} color="#ff9500" /><Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Gérer les alertes</Text><Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/reports')}><Ionicons name="flag-outline" size={22} color="#ff3b30" /><Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Vérifier signalements</Text><Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/map')}><Ionicons name="map-outline" size={22} color="#38bdf8" /><Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Voir la carte</Text><Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
          <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/admin/profile')}><Ionicons name="person-outline" size={22} color="#a855f7" /><Text style={[styles.actionText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mon profil</Text><Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  weatherCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  weatherHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  weatherTemp: { fontSize: 28, fontWeight: 'bold' },
  weatherCondition: { fontSize: 14 },
  weatherDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weatherRisk: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '22%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  alertsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertCard: { padding: 14, borderRadius: 12, marginBottom: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  alertTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  alertMessage: { fontSize: 13, lineHeight: 18 },
  section: { borderRadius: 16, padding: 16, marginBottom: 20 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  actionText: { flex: 1, fontSize: 15 },
})