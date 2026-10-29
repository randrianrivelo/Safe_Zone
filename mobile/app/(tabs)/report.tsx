import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import * as Location from 'expo-location'
import { useThemeStore } from '../../src/stores/themeStore'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ReportScreen() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const types = [
    { value: 'route_endommagee', icon: 'map-outline', label: 'Route endommagée', color: '#ff9500', desc: 'Nids-de-poule, affaissement, route coupée' },
    { value: 'inondation', icon: 'water-outline', label: 'Inondation', color: '#38bdf8', desc: 'Zone inondée, montée des eaux' },
    { value: 'refuge_plein', icon: 'business-outline', label: 'Refuge saturé', color: '#ff9500', desc: 'Plus de places disponibles' },
    { value: 'zone_danger', icon: 'warning-outline', label: 'Zone dangereuse', color: '#ff3b30', desc: 'Glissement, éboulement, danger imminent' },
    { value: 'besoin_urgent', icon: 'heart-outline', label: 'Besoin urgent', color: '#ff3b30', desc: 'Eau, nourriture, médicaments' },
    { value: 'autre', icon: 'ellipsis-horizontal-outline', label: 'Autre', color: '#94a3b8', desc: 'Autre situation à signaler' },
  ]

  useEffect(() => { getLocation() }, [])

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({})
      setPosition({ latitude: location.coords.latitude, longitude: location.coords.longitude })
    }
  }

  const handleSubmit = async () => {
    if (!selectedType) { setError('Veuillez choisir un type de signalement'); return }
    setLoading(true); setError('')
    try {
      const token = await AsyncStorage.getItem('token')
      await fetch(`${API_BASE_URL}/api/reports/`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ report_type: selectedType, description, latitude: position?.latitude, longitude: position?.longitude })
      })
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch (error) { setError('Erreur de connexion au serveur') }
    finally { setLoading(false) }
  }

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#39ff88" />
          <Text style={[styles.successTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Signalement envoyé !</Text>
          <Text style={[styles.successText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Les autorités ont été notifiées. Merci pour votre vigilance.</Text>
          <TouchableOpacity style={styles.successButton} onPress={() => setSent(false)}><Text style={styles.successButtonText}>Nouveau signalement</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="flag-outline" size={24} /> Signaler un danger</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Aidez les autorités en signalant les situations dangereuses dans votre secteur.</Text>

        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="alert-circle-outline" size={18} /> Type de danger</Text>
        <View style={styles.typesGrid}>
          {types.map(type => (
            <TouchableOpacity key={type.value} style={[styles.typeButton, selectedType === type.value && styles.typeButtonActive, { borderColor: selectedType === type.value ? type.color : 'rgba(255,255,255,0.08)' }]} onPress={() => setSelectedType(type.value)}>
              <Ionicons name={type.icon as any} size={28} color={selectedType === type.value ? type.color : '#94a3b8'} />
              <Text style={[styles.typeLabel, { color: selectedType === type.value ? type.color : '#94a3b8' }]}>{type.label}</Text>
              <Text style={[styles.typeDesc, { color: isDark ? '#64748b' : '#94a3b8' }]}>{type.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="chatbubble-outline" size={18} /> Description</Text>
        <TextInput style={[styles.textArea, { color: isDark ? '#ffffff' : '#1a2c3e', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} placeholder="Décrivez la situation en détail..." placeholderTextColor="#94a3b8" value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" />

        <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="location-outline" size={18} /> Position GPS</Text>
        <View style={[styles.gpsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc' }]}>
          <Ionicons name="location-outline" size={24} color={position ? '#39ff88' : '#ff9500'} />
          <View style={styles.gpsInfo}>
            <Text style={[styles.gpsStatus, { color: position ? '#39ff88' : '#ff9500' }]}>{position ? 'Position détectée' : 'Position non disponible'}</Text>
            {position && <Text style={[styles.gpsCoords, { color: isDark ? '#94a3b8' : '#64748b' }]}>{position.latitude.toFixed(4)}, {position.longitude.toFixed(4)}</Text>}
          </View>
          {position && <Ionicons name="checkmark-circle" size={24} color="#39ff88" />}
        </View>

        {error && <View style={styles.errorContainer}><Ionicons name="alert-circle" size={20} color="#ff3b30" /><Text style={styles.errorText}>{error}</Text></View>}

        <TouchableOpacity style={[styles.submitButton, (!selectedType || loading) && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={!selectedType || loading}>
          {loading ? <ActivityIndicator color="#ffffff" /> : <><Ionicons name="send-outline" size={20} color="#ffffff" /><Text style={styles.submitButtonText}>Envoyer le signalement</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 }, scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 }, subtitle: { fontSize: 14, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  typeButton: { width: '48%', alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', gap: 6 },
  typeButtonActive: { backgroundColor: 'rgba(168,85,247,0.1)' }, typeLabel: { fontSize: 14, fontWeight: '600' }, typeDesc: { fontSize: 10, textAlign: 'center' },
  textArea: { height: 120, borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, textAlignVertical: 'top' },
  gpsContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 12, marginBottom: 24 }, gpsInfo: { flex: 1 },
  gpsStatus: { fontSize: 14, fontWeight: '600', marginBottom: 2 }, gpsCoords: { fontSize: 12 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  submitButtonDisabled: { opacity: 0.6 }, submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,59,48,0.1)', padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#ff3b30', fontSize: 14, flex: 1 }, successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }, successText: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  successButton: { backgroundColor: '#a855f7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }, successButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
})