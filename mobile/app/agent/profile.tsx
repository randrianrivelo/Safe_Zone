import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../src/stores/authStore'
import { useThemeStore } from '../../src/stores/themeStore'
import ThemeToggle from '../../src/components/ThemeToggle'
import * as ImagePicker from 'expo-image-picker'
import { API_BASE_URL } from '../../src/config/api'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, logout, updateUser } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadUserData()
    loadAvatar()
  }, [])

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data) {
        setName(data.name || user?.name || '')
        setPhone(data.phone || '')
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    }
  }

  const loadAvatar = async () => {
    if (!user?.id) return
    try {
      const token = await AsyncStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/user/avatar/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data?.avatar_url) {
        setAvatar(`${API_BASE_URL}${data.avatar_url}`)
      }
    } catch (error) {
      console.error('Erreur chargement avatar:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = await AsyncStorage.getItem('token')
      await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone })
      })
      updateUser({ name, phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      Alert.alert('Succès', 'Profil mis à jour')
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Erreur', 'Permission refusée')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setUploading(true)
      const formData = new FormData()
      const asset = result.assets[0]
      formData.append('file', {
        uri: asset.uri,
        name: `avatar_${user?.id}.jpg`,
        type: 'image/jpeg',
      } as any)

      try {
        const token = await AsyncStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/api/user/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        })
        const data = await response.json()
        if (data?.avatar_url) {
          setAvatar(`${API_BASE_URL}${data.avatar_url}`)
          Alert.alert('Succès', 'Avatar mis à jour')
        }
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de changer l\'avatar')
      } finally {
        setUploading(false)
      }
    }
  }

  // ========== DÉCONNEXION CORRIGÉE ==========
  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              // Appeler la fonction logout du store
              await logout()
              // Rediriger vers la landing page
              router.replace('/')
            } catch (error) {
              console.error('Erreur déconnexion:', error)
              // Forcer la déconnexion même en cas d'erreur
              await AsyncStorage.removeItem('token')
              await AsyncStorage.removeItem('user')
              router.replace('/')
            }
          }
        },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mon profil</Text>
        <ThemeToggle />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeAvatar} disabled={uploading}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: '#a855f7' }]}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
              </View>
            )}
            <View style={styles.avatarEdit}>
              <Ionicons name="camera-outline" size={14} color="#ffffff" />
            </View>
            {uploading && <ActivityIndicator style={styles.avatarLoading} color="#a855f7" />}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{user?.name}</Text>
          <Text style={[styles.userEmail, { color: isDark ? '#94a3b8' : '#64748b' }]}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: 'rgba(168,85,247,0.1)' }]}>
            <Text style={[styles.roleText, { color: '#a855f7' }]}>{user?.role || 'citizen'}</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Informations personnelles</Text>

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Nom complet</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { color: isDark ? '#94a3b8' : '#64748b', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}
              value={user?.email}
              editable={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#64748b' }]}>Téléphone</Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#1a2c3e', borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+261 34 00 000 00"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
          </View>

          {saved && (
            <View style={styles.successMessage}>
              <Ionicons name="checkmark-circle" size={20} color="#39ff88" />
              <Text style={styles.successText}>Profil mis à jour !</Text>
            </View>
          )}

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Sauvegarder</Text>}
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Menu</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/history')}>
            <Ionicons name="time-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mon historique</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/settings')}>
            <Ionicons name="settings-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/guide')}>
            <Ionicons name="book-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Guide</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  avatarEdit: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#a855f7', borderRadius: 12, padding: 4 },
  avatarLoading: { position: 'absolute', top: 30, left: 30 },
  userName: { fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },

  card: { borderRadius: 16, padding: 20, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 6 },
  input: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 16 },
  inputDisabled: { opacity: 0.6 },
  saveButton: { backgroundColor: '#a855f7', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 12 },
  menuText: { flex: 1, fontSize: 15 },

  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 10, marginTop: 10, backgroundColor: 'rgba(255,59,48,0.1)' },
  logoutButtonText: { color: '#ff3b30', fontSize: 16, fontWeight: '600' },

  successMessage: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(57,255,136,0.1)', padding: 10, borderRadius: 8, marginBottom: 16 },
  successText: { color: '#39ff88', fontSize: 14 },
})