import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useThemeStore } from '../src/stores/themeStore'

export default function RootLayout() {
  const { theme, initTheme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => { initTheme() }, [])

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: isDark ? '#050816' : '#f5f7fa' },
        headerTintColor: isDark ? '#ffffff' : '#1a2c3e',
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: 'Retour',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="register" options={{ title: 'Inscription' }} />
      <Stack.Screen name="guide" options={{ title: 'Guide' }} />
      <Stack.Screen name="emergency" options={{ title: 'Urgence' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Mot de passe oublié' }} />
      <Stack.Screen name="qr-code" options={{ title: 'QR Code' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
      <Stack.Screen name="agent" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  )
}