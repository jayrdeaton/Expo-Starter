import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

import { Providers } from '@/components/Providers'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({ duration: 500, fade: true })

const RootNavigator = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='(tabs)' />
    </Stack>
  )
}

const RootLayout = () => {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  )
}

export default RootLayout
