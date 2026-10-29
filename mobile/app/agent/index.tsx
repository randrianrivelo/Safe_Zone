import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'
import { useAuthStore } from '../../src/stores/authStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import QRScanner from '../../src/components/QRScanner'

export default function AgentDashboard() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const { user, logout } = useAuthStore()
  const isDark = theme === 'dark'
  const [shelter, setShelter] = useState<any>(null)
  const [people, setPeople] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [weather, setWeather] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')
      const [shelterRes, peopleRes, statsRes, weatherRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/agent/shelter`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/agent/people`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/agent/stats`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/weather/current/antananarivo`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
        fetch(`${API_BASE_URL}/api/alerts/active`, { headers: { 'Authorization': `Bearer ${cleanToken}` } }),
      ])
      setShelter(await shelterRes.json())
      const peopleData = await peopleRes.json()
      setPeople(Array.isArray(peopleData) ? peopleData : [])
      setStats(await statsRes.json())
      setWeather(await weatherRes.json())
      const alertsData = await alertsRes.json()
      setAlerts(Array.isArray(alertsData) ? alertsData : [])
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false) }
  const handleLogout = () => { Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Déconnexion', onPress: () => logout() }]) }
  const handleScanSuccess = () => { loadData() }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}><View style={styles.loadingContainer}><ActivityIndicator size="large" color="#a855f7" /></View></SafeAreaView>

  const occupancyPercent = shelter ? Math.round((shelter.current_occupancy / shelter.capacity_total) * 100) : 0
  const occupancyColor = occupancyPercent >= 90 ? '#ff3b30' : occupancyPercent >= 70 ? '#ff9500' : '#39ff88'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="person-circle-outline" size={24} /> Agent Dashboard</Text>
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

        {/* Refuge assigné */}
        {shelter && (
          <View style={[styles.shelterCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <View style={styles.shelterHeader}>
              <Ionicons name="business-outline" size={32} color="#a855f7" />
              <View style={styles.shelterInfo}>
                <Text style={[styles.shelterName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{shelter.name}</Text>
                <Text style={[styles.shelterDistrict, { color: isDark ? '#94a3b8' : '#64748b' }]}>{shelter.district}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: `${occupancyColor}20` }]}><Text style={[styles.statusText, { color: occupancyColor }]}>{shelter.status === 'ouvert' ? 'Ouvert' : 'Saturé'}</Text></View>
            </View>
            <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${occupancyPercent}%`, backgroundColor: occupancyColor }]} /></View>
            <Text style={[styles.progressText, { color: occupancyColor }]}>{shelter.current_occupancy}/{shelter.capacity_total} places ({occupancyPercent}%)</Text>
            <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}><Ionicons name="qr-code-outline" size={20} color="#ffffff" /><Text style={styles.scanButtonText}>Scanner QR code</Text></TouchableOpacity>
          </View>
        )}

        {/* Statistiques */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="people-outline" size={24} color="#a855f7" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.total || people.length}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Personnes</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="today-outline" size={24} color="#38bdf8" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.todayEntries || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Arrivées</Text></View>
          <View style={[styles.statCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}><Ionicons name="heart-outline" size={24} color="#ff3b30" /><Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{stats?.injured || 0}</Text><Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Blessés</Text></View>
        </View>

        {/* Alertes */}
        {alerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={18} /> Alertes actives</Text>
            {alerts.slice(0, 2).map(alert => (
              <View key={alert.id} style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
                <View style={styles.alertHeader}><Ionicons name="warning-outline" size={20} color="#ff3b30" /><Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{alert.title}</Text></View>
                <Text style={[styles.alertMessage, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Dernières arrivées */}
        {people.length > 0 && (
          <View style={styles.peopleSection}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="time-outline" size={18} /> Dernières arrivées</Text>
            {people.slice(0, 5).map(p => (
              <View key={p.id} style={styles.personItem}>
                <View><Text style={[styles.personName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{p.name}</Text><Text style={[styles.personPhone, { color: isDark ? '#94a3b8' : '#64748b' }]}>{p.phone || 'Pas de téléphone'}</Text></View>
                <TouchableOpacity onPress={() => router.push('/agent/people')}><Ionicons name="chevron-forward" size={20} color={isDark ? '#64748b' : '#94a3b8'} /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onSuccess={handleScanSuccess} />
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
  shelterCard: { borderRadius: 16, padding: 16, marginBottom: 20 },
  shelterHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  shelterInfo: { flex: 1 },
  shelterName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  shelterDistrict: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600', textAlign: 'right', marginBottom: 12 },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', paddingVertical: 12, borderRadius: 12 },
  scanButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11 },
  alertsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertCard: { padding: 14, borderRadius: 12, marginBottom: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  alertTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  alertMessage: { fontSize: 13, lineHeight: 18 },
  peopleSection: { marginBottom: 20 },
  personItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  personName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  personPhone: { fontSize: 12 },
})