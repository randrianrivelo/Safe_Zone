import { Stack } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'

export default function AdminLayout() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? '#050816' : '#f5f7fa' },
        headerTintColor: isDark ? '#ffffff' : '#1a2c3e',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Dashboard Admin' }} />
      <Stack.Screen name="map" options={{ title: 'Carte' }} />
      <Stack.Screen name="alerts" options={{ title: 'Alertes' }} />
      <Stack.Screen name="shelters" options={{ title: 'Refuges' }} />
      <Stack.Screen name="reports" options={{ title: 'Signalements' }} />
      <Stack.Screen name="profile" options={{ title: 'Profil' }} />
    </Stack>
  )
}