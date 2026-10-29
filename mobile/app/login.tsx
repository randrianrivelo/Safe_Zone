import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'
import { useThemeStore } from '../src/stores/themeStore'
import ThemeToggle from '../src/components/ThemeToggle'

export default function LoginScreen() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      return
    }
    setError('')
    try {
      const result = await login(email, password)
      if (result?.role === 'admin') {
        router.replace('/admin')
      } else if (result?.role === 'agent') {
        router.replace('/agent')
      } else {
        router.replace('/(tabs)')
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <View style={styles.content}>
          {/* Header avec bouton thème et retour */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
            </TouchableOpacity>
            <ThemeToggle />
          </View>

          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Connexion</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Accédez à votre compte SafeZone
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

          <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e', flex: 1 }]}
              placeholder="Mot de passe"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: '#a855f7' }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={[styles.forgotLink, { color: '#a855f7' }]}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} />
            <Text style={[styles.dividerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={[styles.socialButton, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
              <Ionicons name="logo-google" size={20} color={isDark ? '#ffffff' : '#1a2c3e'} />
              <Text style={[styles.socialButtonText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.socialButton, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
              <Ionicons name="logo-facebook" size={20} color={isDark ? '#ffffff' : '#1a2c3e'} />
              <Text style={[styles.socialButtonText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Pas encore de compte ?
            </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.registerLink, { color: '#a855f7' }]}> S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 8 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    height: 52,
    marginBottom: 16,
  },
  input: { fontSize: 16, padding: 0 },
  loginButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  loginButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  forgotLink: { textAlign: 'center', marginTop: 16, fontSize: 14 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,59,48,0.1)', padding: 10, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#ff3b30', fontSize: 13, flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  socialContainer: { flexDirection: 'row', gap: 12 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, paddingVertical: 12, borderRadius: 12 },
  socialButtonText: { fontSize: 14, fontWeight: '500' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: '600' },
})