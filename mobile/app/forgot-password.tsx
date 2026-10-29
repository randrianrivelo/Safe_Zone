import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../src/stores/themeStore'
import ThemeToggle from '../src/components/ThemeToggle'
import api from '../src/services/api'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email')
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (error) {
      Alert.alert('Erreur', "Impossible d'envoyer le lien de réinitialisation")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.successContainer}>
          <Ionicons name="mail-outline" size={64} color="#39ff88" />
          <Text style={[styles.successTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Email envoyé !</Text>
          <Text style={[styles.successText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Un lien de réinitialisation vous a été envoyé à l'adresse {email}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login')}>
            <Text style={styles.backButtonText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        {/* Header avec bouton thème et retour */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
          </TouchableOpacity>
          <ThemeToggle />
        </View>

        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mot de passe oublié</Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Entrez votre email pour réinitialiser votre mot de passe
        </Text>

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

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: '#a855f7' }]}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.resetButtonText}>Envoyer le lien</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/login')}>
          <Text style={[styles.backLink, { color: '#a855f7' }]}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 8 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32, lineHeight: 20 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 52,
    marginBottom: 24,
  },
  input: { fontSize: 16, flex: 1 },
  resetButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  resetButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  backLink: { textAlign: 'center', marginTop: 20, fontSize: 14 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  successTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  successText: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
})