import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'
import { useThemeStore } from '../src/stores/themeStore'
import ThemeToggle from '../src/components/ThemeToggle'
import * as Location from 'expo-location'
import { API_BASE_URL } from '../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function EmergencyScreen() {
  const router = useRouter()
  const { emergencyLogin, user } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [pin, setPin] = useState('')
  const [activated, setActivated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email)
      setShowEmailInput(false)
    } else {
      setShowEmailInput(true)
    }
  }, [user])

  const handleKeyPress = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === 4) {
        validatePin(newPin)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const validatePin = async (code: string) => {
    if (!email) {
      Alert.alert('Erreur', 'Email requis')
      setShowEmailInput(true)
      setPin('')
      return
    }

    setLoading(true)
    try {
      await emergencyLogin(email, code)
      setActivated(true)

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({})
        const token = await AsyncStorage.getItem('token')
        await fetch(`${API_BASE_URL}/api/sos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            user_id: user?.id,
            email: email,
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date().toISOString(),
          })
        })
      }

      setTimeout(() => {
        router.replace('/(tabs)/map')
      }, 2000)
    } catch (error) {
      Alert.alert('Erreur', 'Code PIN incorrect')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSubmit = () => {
    if (email && email.includes('@')) {
      setShowEmailInput(false)
    } else {
      Alert.alert('Erreur', 'Email invalide')
    }
  }

  if (activated) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.successContainer}>
          <Ionicons name="shield-checkmark" size={80} color="#39ff88" />
          <Text style={[styles.successTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mode urgence activé</Text>
          <Text style={[styles.successText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Votre position a été envoyée aux secours
          </Text>
          <Text style={[styles.successSubtext, { color: isDark ? '#64748b' : '#94a3b8' }]}>
            Redirection vers la carte...
          </Text>
          <ActivityIndicator style={{ marginTop: 20 }} color="#a855f7" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Urgence</Text>
        <ThemeToggle />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={60} color="#ff3b30" />
        </View>

        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mode Urgence</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Entrez votre code PIN à 4 chiffres
        </Text>

        {showEmailInput ? (
          <View style={styles.emailContainer}>
            <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
              <Ionicons name="mail-outline" size={20} color="#94a3b8" />
              <TextInput
                style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]}
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <TouchableOpacity style={[styles.emailButton, { backgroundColor: '#a855f7' }]} onPress={handleEmailSubmit}>
              <Text style={styles.emailButtonText}>Continuer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.dotsContainer}>
              {[0, 1, 2, 3].map(i => (
                <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
              ))}
            </View>

            <View style={styles.keypad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                <TouchableOpacity key={num} style={styles.key} onPress={() => handleKeyPress(num)} disabled={loading}>
                  <Text style={[styles.keyText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{num}</Text>
                </TouchableOpacity>
              ))}
              <View style={styles.keyPlaceholder} />
              <TouchableOpacity key={0} style={styles.key} onPress={() => handleKeyPress(0)} disabled={loading}>
                <Text style={[styles.keyText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.key} onPress={handleDelete} disabled={loading}>
                <Ionicons name="backspace-outline" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#a855f7" />
                <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Vérification...</Text>
              </View>
            )}
          </>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#94a3b8" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
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
  emailContainer: { width: '100%', marginBottom: 32 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, height: 52, marginBottom: 16 },
  input: { fontSize: 16, flex: 1, marginLeft: 12 },
  emailButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  emailButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  backText: { color: '#94a3b8', fontSize: 14 },
  loadingOverlay: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 16, padding: 20, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  successText: { fontSize: 14, textAlign: 'center', marginBottom: 8 },
  successSubtext: { fontSize: 12, textAlign: 'center' },
})