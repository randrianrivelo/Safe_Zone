import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,   // ← Vérifie que c'est bien TouchableOpacity
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useThemeStore } from '../../src/stores/themeStore'
import ThemeToggle from '../../src/components/ThemeToggle'
import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SOSScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [pin, setPin] = useState('')
  const [activated, setActivated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [savedPin, setSavedPin] = useState<string | null>(null)

  useEffect(() => { loadLocalPin() }, [user])

  const loadLocalPin = async () => {
    try { const pinCode = await AsyncStorage.getItem(`emergency_pin_${user?.id}`); setSavedPin(pinCode) }
    catch (error) { console.error(error) }
  }

  const handleKeyPress = (num: number) => {
    if (pin.length < 4) { const newPin = pin + num; setPin(newPin); if (newPin.length === 4) validatePin(newPin) }
  }

  const handleDelete = () => { setPin(pin.slice(0, -1)) }

  const validatePin = async (code: string) => {
    if (!savedPin) { Alert.alert('Code non défini', 'Allez dans Profil > Code urgence', [{ text: 'OK', onPress: () => router.push('/(tabs)/profile') }]); setPin(''); return }
    if (code !== savedPin) { Alert.alert('Erreur', 'Code PIN incorrect'); setPin(''); return }

    setLoading(true); setActivated(true)
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({})
      console.log('Position d\'urgence:', location.coords.latitude, location.coords.longitude)
    }
    setTimeout(() => router.replace('/(tabs)/map'), 2000)
  }

  if (activated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.successContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#39ff88" />
          <Text style={[styles.successTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mode urgence activé</Text>
          <Text style={[styles.successText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Redirection vers la carte...</Text>
          <ActivityIndicator style={{ marginTop: 20 }} color="#a855f7" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>SOS Urgence</Text>
        <ThemeToggle />
      </View>
      <View style={styles.content}>
        <View style={styles.iconContainer}><Ionicons name="flash" size={60} color="#ff3b30" /></View>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mode Urgence</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Entrez votre code PIN à 4 chiffres</Text>
        <View style={styles.dotsContainer}>{[0,1,2,3].map(i => (<View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />))}</View>
        <View style={styles.keypad}>
          {[1,2,3,4,5,6,7,8,9].map(num => (<TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)} disabled={loading}><Text style={[styles.keyText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{num}</Text></TouchableOpacity>))}
          <View style={styles.keyPlaceholder} />
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress(0)} disabled={loading}><Text style={[styles.keyText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>0</Text></TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={handleDelete} disabled={loading}><Ionicons name="backspace-outline" size={24} color="#94a3b8" /></TouchableOpacity>
        </View>
        {loading && (<View style={styles.loadingOverlay}><ActivityIndicator size="large" color="#a855f7" /><Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Vérification...</Text></View>)}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}><Ionicons name="arrow-back" size={20} color="#94a3b8" /><Text style={styles.backText}>Retour</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  dotsContainer: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#a855f7' },
  dotFilled: { backgroundColor: '#a855f7', borderColor: '#a855f7' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginBottom: 32, maxWidth: 260 },
  key: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  keyPlaceholder: { width: 64, height: 64 },
  keyText: { fontSize: 24, fontWeight: '600' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  backText: { color: '#94a3b8', fontSize: 14 },
  loadingOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 20, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  successText: { fontSize: 14, textAlign: 'center' },
})