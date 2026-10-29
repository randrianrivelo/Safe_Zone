import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useThemeStore } from '../src/stores/themeStore'

export default function LandingScreen() {
  const router = useRouter()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#050816' : '#f5f7fa' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={[styles.logoContainer, { backgroundColor: '#a855f7' }]}>
            <Ionicons name="shield-checkmark" size={48} color="#ffffff" />
          </View>
          <Text style={[styles.appName, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>SafeZone</Text>
          <Text style={[styles.tagline, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Votre sécurité, notre priorité
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <Ionicons name="map-outline" size={28} color="#38bdf8" />
            <Text style={[styles.featureTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Refuges</Text>
            <Text style={[styles.featureDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>Trouvez le refuge le plus proche avec itinéraire</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <Ionicons name="alert-circle-outline" size={28} color="#ff9500" />
            <Text style={[styles.featureTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Alertes</Text>
            <Text style={[styles.featureDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>Recevez les alertes en temps réel des autorités</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <Ionicons name="flash-outline" size={28} color="#ff3b30" />
            <Text style={[styles.featureTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>SOS</Text>
            <Text style={[styles.featureDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>Activez le mode urgence en un clic</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff' }]}>
            <Ionicons name="flag-outline" size={28} color="#39ff88" />
            <Text style={[styles.featureTitle, { color: isDark ? '#ffffff' : '#1a2c3e' }]}>Signalement</Text>
            <Text style={[styles.featureDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>Signalez les dangers pour aider la communauté</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Ionicons name="log-in-outline" size={20} color="#ffffff" />
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.registerBtn, { borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#a855f7' }]} onPress={() => router.push('/register')}>
            <Text style={[styles.registerBtnText, { color: isDark ? '#ffffff' : '#a855f7' }]}>Créer un compte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={[styles.skipText, { color: isDark ? '#64748b' : '#94a3b8' }]}>Continuer sans compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  appName: { fontSize: 36, fontWeight: 'bold', marginBottom: 8 },
  tagline: { fontSize: 16, textAlign: 'center' },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  featureCard: { width: '47%', padding: 16, borderRadius: 16, alignItems: 'center', gap: 8 },
  featureTitle: { fontSize: 15, fontWeight: '600' },
  featureDesc: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  actions: { gap: 12 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#a855f7', paddingVertical: 14, borderRadius: 12 },
  loginBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  registerBtn: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  registerBtnText: { fontSize: 16, fontWeight: '600' },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontSize: 14 },
})
