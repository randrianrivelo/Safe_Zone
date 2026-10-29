import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import QRScanner from '../../src/components/QRScanner'

export default function AgentScanner() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [showScanner, setShowScanner] = useState(false)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="qr-code-outline" size={24} /> Scanner QR Code</Text>
      <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Scannez le QR code d'un citoyen pour l'enregistrer</Text>
      <TouchableOpacity style={styles.scanButton} onPress={() => setShowScanner(true)}>
        <Ionicons name="qr-code-outline" size={64} color="#ffffff" />
        <Text style={styles.scanButtonText}>Scanner un QR code</Text>
      </TouchableOpacity>
      <QRScanner visible={showScanner} onClose={() => setShowScanner(false)} onSuccess={() => Alert.alert('Succès', 'Personne enregistrée')} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 40, textAlign: 'center', paddingHorizontal: 40 },
  scanButton: { backgroundColor: '#a855f7', padding: 40, borderRadius: 30, alignItems: 'center', gap: 16 },
  scanButtonText: { color: '#ffffff', fontSize: 18, fontWeight: '600' },
})