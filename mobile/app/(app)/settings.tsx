import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function SettingsScreen() {
  const { theme, toggleTheme, setAccent } = useThemeStore()
  const isDark = theme === 'dark'

  const [notifications, setNotifications] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [mapDownloaded, setMapDownloaded] = useState(false)

  useEffect(() => { loadSettings(); checkMapDownloaded() }, [])

  const loadSettings = async () => {
    try {
      const savedNotifs = await AsyncStorage.getItem('notifications_enabled')
      const savedSound = await AsyncStorage.getItem('sound_enabled')
      const savedAnimations = await AsyncStorage.getItem('animations_enabled')
      if (savedNotifs !== null) setNotifications(savedNotifs === 'true')
      if (savedSound !== null) setSoundEnabled(savedSound === 'true')
      if (savedAnimations !== null) setAnimations(savedAnimations === 'true')
    } catch (error) { console.error(error) }
  }

  const checkMapDownloaded = async () => {
    const saved = await AsyncStorage.getItem('offline_map_downloaded')
    setMapDownloaded(saved === 'true')
  }

  const downloadOfflineMap = async () => {
    setDownloading(true)
    try {
      await AsyncStorage.setItem('offline_map_downloaded', 'true')
      setMapDownloaded(true)
      Alert.alert('Succès', 'Carte téléchargée pour utilisation hors ligne')
    } catch (error) { Alert.alert('Erreur', 'Impossible de télécharger la carte') }
    finally { setDownloading(false) }
  }

  const saveSetting = async (key: string, value: any) => { await AsyncStorage.setItem(key, String(value)) }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Text style={[styles.title, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="settings-outline" size={24} /> Paramètres</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="color-palette-outline" size={18} /> Apparence</Text>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Mode sombre</Text><Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#64748b', true: '#a855f7' }} thumbColor="#ffffff" /></View>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Couleur d'accent</Text><View style={styles.accentOptions}><TouchableOpacity style={[styles.accentDot, { backgroundColor: '#a855f7' }]} onPress={() => setAccent('purple')} /><TouchableOpacity style={[styles.accentDot, { backgroundColor: '#38bdf8' }]} onPress={() => setAccent('blue')} /><TouchableOpacity style={[styles.accentDot, { backgroundColor: '#39ff88' }]} onPress={() => setAccent('green')} /><TouchableOpacity style={[styles.accentDot, { backgroundColor: '#ff3b30' }]} onPress={() => setAccent('red')} /></View></View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="notifications-outline" size={18} /> Notifications</Text>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Notifications push</Text><Switch value={notifications} onValueChange={(v) => { setNotifications(v); saveSetting('notifications_enabled', v) }} trackColor={{ false: '#64748b', true: '#a855f7' }} thumbColor="#ffffff" /></View>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Son d'alerte</Text><Switch value={soundEnabled} onValueChange={(v) => { setSoundEnabled(v); saveSetting('sound_enabled', v) }} trackColor={{ false: '#64748b', true: '#a855f7' }} thumbColor="#ffffff" /></View>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Animations</Text><Switch value={animations} onValueChange={(v) => { setAnimations(v); saveSetting('animations_enabled', v) }} trackColor={{ false: '#64748b', true: '#a855f7' }} thumbColor="#ffffff" /></View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="map-outline" size={18} /> Mode hors ligne</Text>
          <View style={styles.settingRow}>
            <View><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Télécharger la carte</Text><Text style={[styles.settingDesc, { color: isDark ? '#64748b' : '#94a3b8' }]}>Utilisable sans connexion internet</Text></View>
            <TouchableOpacity style={[styles.downloadBtn, mapDownloaded && styles.downloadBtnDisabled]} onPress={downloadOfflineMap} disabled={downloading || mapDownloaded}>
              {downloading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.downloadBtnText}>{mapDownloaded ? 'Téléchargé' : 'Télécharger'}</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="trash-outline" size={18} /> Données</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => { AsyncStorage.removeItem('route_history'); Alert.alert('Succès', 'Historique effacé') }}><Text style={[styles.settingLabel, { color: '#ff3b30' }]}>Vider l'historique</Text><Ionicons name="trash-outline" size={20} color="#ff3b30" /></TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}><Ionicons name="information-circle-outline" size={18} /> À propos</Text>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Version</Text><Text style={[styles.settingValue, { color: isDark ? '#94a3b8' : '#64748b' }]}>1.0.0</Text></View>
          <View style={styles.settingRow}><Text style={[styles.settingLabel, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Développé par</Text><Text style={[styles.settingValue, { color: isDark ? '#94a3b8' : '#64748b' }]}>ESMIA Innovation</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: 'bold', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  section: { borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7, flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  settingLabel: { fontSize: 15 },
  settingDesc: { fontSize: 11, marginTop: 2 },
  settingValue: { fontSize: 14 },
  accentOptions: { flexDirection: 'row', gap: 12 },
  accentDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ffffff' },
  downloadBtn: { backgroundColor: '#a855f7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  downloadBtnDisabled: { backgroundColor: '#39ff88', opacity: 0.7 },
  downloadBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' },
})