import { Stack } from 'expo-router'
import { useThemeStore } from '../../src/stores/themeStore'

export default function AppLayout() {
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
      <Stack.Screen name="history" options={{ title: 'Mon historique' }} />
      <Stack.Screen name="settings" options={{ title: 'Paramètres' }} />
    </Stack>
  )
}