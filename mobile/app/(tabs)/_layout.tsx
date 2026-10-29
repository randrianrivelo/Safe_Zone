import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useThemeStore } from '../../src/stores/themeStore'

export default function TabsLayout() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0b1023' : '#ffffff',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#a855f7',
        tabBarInactiveTintColor: isDark ? '#64748b' : '#94a3b8',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Carte', tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="alerts" options={{ title: 'Alertes', tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="sos" options={{ title: 'SOS', tabBarIcon: ({ color, size }) => <Ionicons name="flash-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="report" options={{ title: 'Signaler', tabBarIcon: ({ color, size }) => <Ionicons name="flag-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  )
}