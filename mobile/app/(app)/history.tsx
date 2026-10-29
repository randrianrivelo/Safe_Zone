import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { API_BASE_URL } from '../../src/config/api'

interface HistoryItem {
  id: number
  type: 'itineraire' | 'signalement'
  title: string
  description: string
  date: Date
  icon: string
  color: string
  details?: any
}

export default function HistoryScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'itineraire' | 'signalement'>('all')

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const items: HistoryItem[] = []

      // 1. Charger les itinéraires (stockage local)
      const savedRoutes = await AsyncStorage.getItem('route_history')
      const routes = savedRoutes ? JSON.parse(savedRoutes) : []

      routes.forEach((route: any) => {
        items.push({
          id: route.id || Date.now() + Math.random(),
          type: 'itineraire',
          title: `Itinéraire vers ${route.shelter_name}`,
          description: `${route.distance_km} km • ${route.duration_min} min`,
          date: new Date(route.timestamp),
          icon: 'map-outline',
          color: '#a855f7',
          details: { shelter_id: route.shelter_id }
        })
      })

      // 2. Charger les signalements (API)
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')

      if (cleanToken) {
        const reportsRes = await fetch(`${API_BASE_URL}/api/reports/`, {
          headers: { 'Authorization': `Bearer ${cleanToken}` }
        })

        if (reportsRes.ok) {
          const reports = await reportsRes.json()
          reports.forEach((report: any) => {
            items.push({
              id: report.id,
              type: 'signalement',
              title: getReportTitle(report.report_type),
              description: report.description?.substring(0, 80) || 'Aucune description',
              date: new Date(report.created_at),
              icon: getReportIcon(report.report_type),
              color: getReportColor(report.report_type),
              details: { status: report.status, type: report.report_type }
            })
          })
        }
      }

      // Trier par date (plus récent en premier)
      items.sort((a, b) => b.date.getTime() - a.date.getTime())
      setHistory(items)
    } catch (error) {
      console.error('Erreur chargement historique:', error)
    } finally {
      setLoading(false)
    }
  }

  const getReportTitle = (type: string) => {
    const titles: Record<string, string> = {
      route_endommagee: 'Route endommagée',
      zone_danger: 'Zone dangereuse',
      refuge_plein: 'Refuge saturé',
      inondation: 'Inondation',
      besoin_urgent: 'Besoin urgent',
      autre: 'Autre signalement'
    }
    return titles[type] || 'Signalement'
  }

  const getReportIcon = (type: string) => {
    const icons: Record<string, string> = {
      route_endommagee: 'map-outline',
      zone_danger: 'warning-outline',
      refuge_plein: 'business-outline',
      inondation: 'water-outline',
      besoin_urgent: 'heart-outline',
      autre: 'ellipsis-horizontal-outline'
    }
    return icons[type] || 'flag-outline'
  }

  const getReportColor = (type: string) => {
    const colors: Record<string, string> = {
      route_endommagee: '#ff9500',
      zone_danger: '#ff3b30',
      refuge_plein: '#ff9500',
      inondation: '#38bdf8',
      besoin_urgent: '#ff3b30',
      autre: '#94a3b8'
    }
    return colors[type] || '#a855f7'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      en_attente: 'En attente',
      verifie: 'Vérifié',
      rejete: 'Rejeté'
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      en_attente: '#ffd60a',
      verifie: '#39ff88',
      rejete: '#ff3b30'
    }
    return colors[status] || '#94a3b8'
  }

  const clearHistory = async () => {
    Alert.alert(
      'Effacer l\'historique',
      'Voulez-vous vraiment effacer tous vos itinéraires ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('route_history')
            loadHistory()
            Alert.alert('Succès', 'Historique effacé')
          }
        }
      ]
    )
  }

  const deleteHistoryItem = async (item: HistoryItem) => {
    if (item.type === 'itineraire') {
      const savedRoutes = await AsyncStorage.getItem('route_history')
      const routes = savedRoutes ? JSON.parse(savedRoutes) : []
      const newRoutes = routes.filter((r: any) => r.id !== item.id)
      await AsyncStorage.setItem('route_history', JSON.stringify(newRoutes))
      loadHistory()
      Alert.alert('Succès', 'Élément supprimé')
    }
  }

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true
    return item.type === filter
  })

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#a855f7" />
          <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
            Chargement...
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
          <Ionicons name="time-outline" size={24} /> Mon historique
        </Text>
        {history.filter(h => h.type === 'itineraire').length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={22} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && { color: '#ffffff' }]}>
            Tous ({history.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'itineraire' && styles.filterChipActive]}
          onPress={() => setFilter('itineraire')}
        >
          <Ionicons name="map-outline" size={16} color={filter === 'itineraire' ? '#ffffff' : '#94a3b8'} />
          <Text style={[styles.filterText, filter === 'itineraire' && { color: '#ffffff' }]}>
            Itinéraires ({history.filter(h => h.type === 'itineraire').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'signalement' && styles.filterChipActive]}
          onPress={() => setFilter('signalement')}
        >
          <Ionicons name="flag-outline" size={16} color={filter === 'signalement' ? '#ffffff' : '#94a3b8'} />
          <Text style={[styles.filterText, filter === 'signalement' && { color: '#ffffff' }]}>
            Signalements ({history.filter(h => h.type === 'signalement').length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color={isDark ? '#64748b' : '#94a3b8'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
              Aucun historique
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Vos itinéraires et signalements apparaîtront ici
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/map')}
            >
              <Ionicons name="map-outline" size={20} color="#ffffff" />
              <Text style={styles.emptyButtonText}>Trouver un refuge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredHistory.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.historyCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}
              onPress={() => {
                if (item.type === 'itineraire' && item.details?.shelter_id) {
                  router.push(`/(tabs)/map?shelter=${item.details.shelter_id}`)
                }
              }}
            >
              <View style={[styles.cardIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
                  {item.title}
                </Text>
                <Text style={[styles.cardDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={[styles.cardDate, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                  {item.date.toLocaleDateString('fr-FR')} à {item.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {item.type === 'signalement' && item.details?.status && (
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.details.status)}20` }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.details.status) }]}>
                      {getStatusLabel(item.details.status)}
                    </Text>
                  </View>
                )}
              </View>
              {item.type === 'itineraire' && (
                <TouchableOpacity onPress={() => deleteHistoryItem(item)} style={styles.deleteIcon}>
                  <Ionicons name="close-circle-outline" size={22} color="#ff3b30" />
                </TouchableOpacity>
              )}
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#64748b' : '#94a3b8'} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  clearButton: { padding: 8 },

  filters: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#a855f7' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#94a3b8' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#a855f7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 16 },
  emptyButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, gap: 14 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  cardDate: { fontSize: 11, marginTop: 2 },
  deleteIcon: { padding: 4 },

  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '600' },
})