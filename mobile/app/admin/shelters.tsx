import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function AdminShelters() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [shelters, setShelters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadShelters() }, [])

  const loadShelters = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const cleanToken = token?.replace(/^"|"$/g, '')
      const res = await fetch(`${API_BASE_URL}/api/shelters/`, { headers: { 'Authorization': `Bearer ${cleanToken}` } })
      setShelters(await res.json())
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }

  const onRefresh = async () => { setRefreshing(true); await loadShelters(); setRefreshing(false) }

  const updateStatus = async (id: number, status: string) => {
    const token = await AsyncStorage.getItem('token')
    await fetch(`${API_BASE_URL}/api/shelters/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status })
    })
    loadShelters()
    Alert.alert('Succès', 'Statut mis à jour')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ouvert': return '#39ff88'
      case 'sature': return '#ff9500'
      case 'ferme': return '#ff3b30'
      default: return '#38bdf8'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ouvert': return 'Ouvert'
      case 'sature': return 'Saturé'
      case 'ferme': return 'Fermé'
      default: return 'En préparation'
    }
  }

  if (loading) return <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}><ActivityIndicator size="large" color="#a855f7" /></SafeAreaView>

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="business-outline" size={24} /> Gestion des refuges</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}><Ionicons name="refresh-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {shelters.map(shelter => {
          const pct = shelter.capacity_total ? Math.round((shelter.current_occupancy / shelter.capacity_total) * 100) : 0
          const color = pct >= 90 ? '#ff3b30' : pct >= 50 ? '#ff9500' : '#39ff88'
          return (
            <View key={shelter.id} style={[styles.shelterCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
              <View style={styles.shelterHeader}>
                <Text style={[styles.shelterName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{shelter.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(shelter.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(shelter.status) }]}>{getStatusLabel(shelter.status)}</Text>
                </View>
              </View>
              <Text style={[styles.shelterDistrict, { color: isDark ? '#94a3b8' : '#64748b' }]}>{shelter.district}</Text>
              <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} /></View>
              <Text style={[styles.progressText, { color }]}>{shelter.current_occupancy}/{shelter.capacity_total} ({pct}%)</Text>
              <View style={styles.services}>
                {shelter.has_water && <Ionicons name="water-outline" size={18} color="#38bdf8" />}
                {shelter.has_electricity && <Ionicons name="flash-outline" size={18} color="#ffd60a" />}
                {shelter.has_medical && <Ionicons name="medkit-outline" size={18} color="#ff3b30" />}
                {shelter.has_food && <Ionicons name="restaurant-outline" size={18} color="#ff9500" />}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(57,255,136,0.1)' }]} onPress={() => updateStatus(shelter.id, 'ouvert')}><Text style={{ color: '#39ff88' }}>Ouvrir</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,149,0,0.1)' }]} onPress={() => updateStatus(shelter.id, 'sature')}><Text style={{ color: '#ff9500' }}>Saturer</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(255,59,48,0.1)' }]} onPress={() => updateStatus(shelter.id, 'ferme')}><Text style={{ color: '#ff3b30' }}>Fermer</Text></TouchableOpacity>
              </View>
            </View>
          )
        })}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  refreshButton: { padding: 8 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  shelterCard: { borderRadius: 16, padding: 16 },
  shelterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  shelterName: { fontSize: 16, fontWeight: '600', flex: 1 },
  shelterDistrict: { fontSize: 13, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 11, fontWeight: '600', textAlign: 'right', marginBottom: 8 },
  services: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
})