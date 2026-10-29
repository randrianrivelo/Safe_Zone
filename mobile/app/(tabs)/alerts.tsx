import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
  RefreshControl, ActivityIndicator
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AlertsScreen() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')

  useEffect(() => { loadAlerts() }, [])

  const loadAlerts = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')
      const res = await fetch(`${API_BASE_URL}/api/alerts/active`, { headers: { 'Authorization': `Bearer ${cleanToken}` } })
      const data = await res.json()
      setAlerts(Array.isArray(data) ? data : [])
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const onRefresh = async () => { setRefreshing(true); await loadAlerts(); setRefreshing(false) }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critique': return '#ff3b30'
      case 'eleve': return '#ff9500'
      case 'moyen': return '#ffd60a'
      default: return '#39ff88'
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critique': return 'Critique'
      case 'eleve': return 'Élevé'
      case 'moyen': return 'Moyen'
      default: return 'Faible'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critique': return 'alert-circle'
      case 'eleve': return 'warning'
      case 'moyen': return 'information-circle'
      default: return 'checkmark-circle'
    }
  }

  const filteredAlerts = selectedSeverity === 'all' ? alerts : alerts.filter(a => a.severity === selectedSeverity)

  const severityStats = {
    all: alerts.length,
    critique: alerts.filter(a => a.severity === 'critique').length,
    eleve: alerts.filter(a => a.severity === 'eleve').length,
    moyen: alerts.filter(a => a.severity === 'moyen').length,
    faible: alerts.filter(a => a.severity === 'faible' || !a.severity).length,
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#a855f7" /><Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Chargement des alertes...</Text></View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={24} /> Alertes</Text>

      {/* Filtres de sévérité */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={[styles.filterChip, selectedSeverity === 'all' && styles.filterChipActive]} onPress={() => setSelectedSeverity('all')}>
            <Text style={[styles.filterText, selectedSeverity === 'all' && { color: '#ffffff' }]}>Toutes ({severityStats.all})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: 'rgba(255,59,48,0.1)' }, selectedSeverity === 'critique' && styles.filterChipActiveCritique]} onPress={() => setSelectedSeverity('critique')}>
            <Text style={[styles.filterText, { color: '#ff3b30' }, selectedSeverity === 'critique' && { color: '#ffffff' }]}>Critique ({severityStats.critique})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: 'rgba(255,149,0,0.1)' }, selectedSeverity === 'eleve' && styles.filterChipActiveEleve]} onPress={() => setSelectedSeverity('eleve')}>
            <Text style={[styles.filterText, { color: '#ff9500' }, selectedSeverity === 'eleve' && { color: '#ffffff' }]}>Élevé ({severityStats.eleve})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: 'rgba(255,214,10,0.1)' }, selectedSeverity === 'moyen' && styles.filterChipActiveMoyen]} onPress={() => setSelectedSeverity('moyen')}>
            <Text style={[styles.filterText, { color: '#ffd60a' }, selectedSeverity === 'moyen' && { color: '#ffffff' }]}>Moyen ({severityStats.moyen})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, { backgroundColor: 'rgba(57,255,136,0.1)' }, selectedSeverity === 'faible' && styles.filterChipActiveFaible]} onPress={() => setSelectedSeverity('faible')}>
            <Text style={[styles.filterText, { color: '#39ff88' }, selectedSeverity === 'faible' && { color: '#ffffff' }]}>Faible ({severityStats.faible})</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}>
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Aucune alerte</Text>
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Tout est calme pour le moment</Text>
          </View>
        ) : (
          filteredAlerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff', borderLeftColor: getSeverityColor(alert.severity) }]}>
              <View style={styles.alertHeader}>
                <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(alert.severity)}20` }]}>
                  <Ionicons name={getSeverityIcon(alert.severity)} size={14} color={getSeverityColor(alert.severity)} />
                  <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>{getSeverityLabel(alert.severity)}</Text>
                </View>
                <Text style={[styles.alertDate, { color: isDark ? '#94a3b8' : '#64748b' }]}>{new Date(alert.created_at).toLocaleDateString('fr-FR')} à {new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{alert.title}</Text>
              <Text style={[styles.alertMessage, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.message}</Text>
              {alert.target_district && (
                <View style={styles.districtBadge}><Ionicons name="location-outline" size={14} color="#a855f7" /><Text style={[styles.districtText, { color: isDark ? '#94a3b8' : '#64748b' }]}>{alert.target_district}</Text></View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },

  filtersScroll: { maxHeight: 50, marginBottom: 16 },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#a855f7' },
  filterChipActiveCritique: { backgroundColor: '#ff3b30' },
  filterChipActiveEleve: { backgroundColor: '#ff9500' },
  filterChipActiveMoyen: { backgroundColor: '#ffd60a' },
  filterChipActiveFaible: { backgroundColor: '#39ff88' },
  filterText: { fontSize: 14, fontWeight: '500', color: '#94a3b8' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14 },

  alertCard: { borderRadius: 16, padding: 16, borderLeftWidth: 4 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  severityText: { fontSize: 11, fontWeight: '600' },
  alertDate: { fontSize: 11 },
  alertTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  alertMessage: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  districtBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  districtText: { fontSize: 12 },
})