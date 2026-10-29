import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'
import { useAuthStore } from '../../src/stores/authStore'

export default function ProfileScreen() {
  const router = useRouter()
  const { theme, toggleTheme } = useThemeStore()
  const { user, logout, isAuthenticated } = useAuthStore()
  const isDark = theme === 'dark'

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Se déconnecter', style: 'destructive', onPress: async () => { await logout(); router.replace('/') } }
      ]
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
        <View style={styles.center}>
          <Ionicons name="person-outline" size={64} color={isDark ? '#64748b' : '#94a3b8'} />
          <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Non connecté</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar / Infos */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: '#a855f7' }]}>
            <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || '?'}</Text>
          </View>
          <Text style={[styles.name, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>{user.name || 'Utilisateur'}</Text>
          <Text style={[styles.email, { color: isDark ? '#94a3b8' : '#64748b' }]}>{user.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#ff3b3020' : user.role === 'agent' ? '#38bdf820' : '#a855f720' }]}>
            <Text style={[styles.roleText, { color: user.role === 'admin' ? '#ff3b30' : user.role === 'agent' ? '#38bdf8' : '#a855f7' }]}>
              {user.role === 'admin' ? 'Administrateur' : user.role === 'agent' ? 'Agent' : 'Citoyen'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/history')}>
            <Ionicons name="time-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mon historique</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} />
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/settings')}>
            <Ionicons name="settings-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Paramètres</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} />
          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>
              Mode {isDark ? 'clair' : 'sombre'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]} />
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/guide')}>
            <Ionicons name="book-outline" size={22} color="#a855f7" />
            <Text style={[styles.menuText, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Guide de sécurité</Text>
            <Ionicons name="chevron-forward" size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </TouchableOpacity>
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#ff3b30" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: isDark ? '#64748b' : '#94a3b8' }]}>SafeZone v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16 },
  loginBtn: { backgroundColor: '#a855f7', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  loginBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#ffffff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 12 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16 },
  roleText: { fontSize: 12, fontWeight: '600' },
  section: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, gap: 12 },
  menuText: { flex: 1, fontSize: 15 },
  divider: { height: 1, marginHorizontal: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)', marginBottom: 24 },
  logoutText: { color: '#ff3b30', fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12 },
})
