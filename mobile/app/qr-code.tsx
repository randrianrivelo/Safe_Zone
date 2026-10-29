import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Share } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../src/stores/themeStore'
import { useAuthStore } from '../src/stores/authStore'
import QRCodeGenerator from '../src/components/QRCodeGenerator'

export default function QRCodeScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={24} color={isDark ? '#ffffff' : '#1a2c3e'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mon QR Code</Text>
        <View style={{ width: 40 }} />
      </View>

      <QRCodeGenerator />

      <Text style={[styles.infoText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
        Présentez ce code à un agent pour être enregistré rapidement
      </Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
    paddingHorizontal: 40,
  },
})