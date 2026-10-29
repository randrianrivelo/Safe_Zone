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
  ScrollView,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../src/stores/authStore'
import { useThemeStore } from '../src/stores/themeStore'
import ThemeToggle from '../src/components/ThemeToggle'

export default function RegisterScreen() {
  const router = useRouter()
  const { register, isLoading } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    setError('')
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      })
      router.replace('/(tabs)')
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription")
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header avec bouton thème et retour */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
            </TouchableOpacity>
            <ThemeToggle />
          </View>

          <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Inscription</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Créez votre compte SafeZone
          </Text>

          <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <Ionicons name="person-outline" size={20} color="#94a3b8" />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]}
              placeholder="Nom complet"
              placeholderTextColor="#94a3b8"
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
          </View>

          <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <Ionicons name="mail-outline" size={20} color="#94a3b8" />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]}
              placeholder="Email"
              placeholderTextColor="#94a3b8"
              value={form.email}
              onChangeText={(text) => setForm({ ...form, email: text })}
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
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e', flex: 1 }]}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor="#94a3b8"
              value={form.confirmPassword}
              onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <Ionicons name="call-outline" size={20} color="#94a3b8" />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e' }]}
              placeholder="Téléphone (optionnel)"
              placeholderTextColor="#94a3b8"
              value={form.phone}
              onChangeText={(text) => setForm({ ...form, phone: text })}
              keyboardType="phone-pad"
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={16} color="#ff3b30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: '#a855f7' }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.registerButtonText}>S'inscrire</Text>}
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

          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.loginLink, { color: '#a855f7' }]}> Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
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
  registerButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  registerButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  errorContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,59,48,0.1)', padding: 10, borderRadius: 8, marginBottom: 16 },
  errorText: { color: '#ff3b30', fontSize: 13, flex: 1 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  socialContainer: { flexDirection: 'row', gap: 12 },
  socialButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, paddingVertical: 12, borderRadius: 12 },
  socialButtonText: { fontSize: 14, fontWeight: '500' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: '600' },
})