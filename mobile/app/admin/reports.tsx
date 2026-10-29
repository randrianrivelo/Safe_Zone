import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AdminReports() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'verifie' | 'rejete'>('en_attente')

  useEffect(() => { loadReports() }, [])

  const loadReports = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')
      const res = await fetch(`${API_BASE_URL}/api/reports/all`, { headers: { 'Authorization': `Bearer ${cleanToken}` } })
      setReports(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const updateStatus = async (id: number, action: 'verify' | 'reject') => {
    const token = await AsyncStorage.getItem('token')
    await fetch(`${API_BASE_URL}/api/reports/${id}/${action}`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` } })
    await loadReports()
    Alert.alert('Succès', `Signalement ${action === 'verify' ? 'vérifié' : 'rejeté'}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_attente': return '#ffd60a'
      case 'verifie': return '#39ff88'
      case 'rejete': return '#ff3b30'
      default: return '#94a3b8'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'en_attente': return 'En attente'
      case 'verifie': return 'Vérifié'
      case 'rejete': return 'Rejeté'
      default: return status
    }
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      route_endommagee: 'Route endommagée',
      zone_danger: 'Zone dangereuse',
      refuge_plein: 'Refuge saturé',
      inondation: 'Inondation',
      besoin_urgent: 'Besoin urgent',
      autre: 'Autre'
    }
    return types[type] || type
  }

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter)
  const stats = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'en_attente').length,
    verified: reports.filter(r => r.status === 'verifie').length,
    rejected: reports.filter(r => r.status === 'rejete').length
  }

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}><ActivityIndicator size="large" color="#a855f7" /></SafeAreaView>

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="flag-outline" size={24} /> Signalements</Text>
        <TouchableOpacity onPress={loadReports} style={styles.refreshButton}><Ionicons name="refresh-outline" size={22} color={isDark ? '#ffffff' : '#1a2c3e'} /></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
        <View style={styles.filtersContainer}>
          <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterChipActive]} onPress={() => setFilter('all')}><Text style={[styles.filterText, filter === 'all' && { color: '#ffffff' }]}>Tous ({stats.all})</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, filter === 'en_attente' && styles.filterChipActive]} onPress={() => setFilter('en_attente')}><Text style={[styles.filterText, filter === 'en_attente' && { color: '#ffffff' }]}>En attente ({stats.pending})</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, filter === 'verifie' && styles.filterChipActive]} onPress={() => setFilter('verifie')}><Text style={[styles.filterText, filter === 'verifie' && { color: '#ffffff' }]}>Vérifiés ({stats.verified})</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, filter === 'rejete' && styles.filterChipActive]} onPress={() => setFilter('rejete')}><Text style={[styles.filterText, filter === 'rejete' && { color: '#ffffff' }]}>Rejetés ({stats.rejected})</Text></TouchableOpacity>
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredReports.length === 0 ? (
          <View style={styles.emptyContainer}><Ionicons name="chatbubble-ellipses-outline" size={64} color={isDark ? '#64748b' : '#94a3b8'} /><Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Aucun signalement</Text></View>
        ) : (
          filteredReports.map(report => (
            <View key={report.id} style={[styles.reportCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
              <View style={styles.reportHeader}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(report.status)}20` }]}><Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>{getStatusLabel(report.status)}</Text></View>
                <Text style={[styles.reportType, { color: isDark ? '#94a3b8' : '#64748b' }]}>{getTypeLabel(report.report_type)}</Text>
              </View>
              <Text style={[styles.reportDescription, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{report.description || 'Aucune description'}</Text>
              <Text style={[styles.reportDate, { color: isDark ? '#64748b' : '#94a3b8' }]}>{new Date(report.created_at).toLocaleString('fr-FR')}</Text>
              {report.status === 'en_attente' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.verifyBtn, { backgroundColor: 'rgba(57,255,136,0.1)' }]} onPress={() => updateStatus(report.id, 'verify')}><Ionicons name="checkmark-circle-outline" size={18} color="#39ff88" /><Text style={{ color: '#39ff88' }}>Vérifier</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.rejectBtn, { backgroundColor: 'rgba(255,59,48,0.1)' }]} onPress={() => updateStatus(report.id, 'reject')}><Ionicons name="close-circle-outline" size={18} color="#ff3b30" /><Text style={{ color: '#ff3b30' }}>Rejeter</Text></TouchableOpacity>
                </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  refreshButton: { padding: 8 },
  filtersScroll: { maxHeight: 50, marginBottom: 16 },
  filtersContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  filterChipActive: { backgroundColor: '#a855f7' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#94a3b8' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 16 },
  reportCard: { borderRadius: 16, padding: 16 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  reportType: { fontSize: 12 },
  reportDescription: { fontSize: 14, marginBottom: 8, lineHeight: 20 },
  reportDate: { fontSize: 11, marginBottom: 12 },
  actionButtons: { flexDirection: 'row', gap: 12 },
  verifyBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
})