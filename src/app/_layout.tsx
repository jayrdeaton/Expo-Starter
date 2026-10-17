import { useAutoPaperTheme } from '@rific/auto-paper'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { Platform, StyleSheet, View } from 'react-native'

import { Providers } from '@/components/Providers'
import { screenShell } from '@/utils/webLayout'

SplashScreen.preventAutoHideAsync()
SplashScreen.setOptions({ duration: 500, fade: true })

// The status bar is styled here, per screen, rather than by a React Native StatusBar (auto-paper's
// Provider gets statusBar={false}, see Theme.tsx): an app linked against the iOS 27 SDK can't set it
// app-wide. react-native-screens sets it per view controller, which needs
// UIViewControllerBasedStatusBarAppearance on (app.json). The style comes from the theme, not
// 'auto', because 'auto' follows the system appearance and the app's own Appearance setting can
// differ from it. Not in a dev-client build on iOS: expo-dev-launcher's own view controller sits
// above react-native-screens' stack there, so the bar keeps the system's style. Release builds
// (preview, production) don't have it.
//
// On web, screens sit in a centered column (screenShell) over the theme's background, so a wide
// window doesn't stretch them. Dialogs, toasts and drawers render above this, so they still use the
// whole window, the same as in the games.
const RootNavigator = () => {
  const { colors, dark } = useAutoPaperTheme()
  const stack = (
    <Stack screenOptions={{ headerShown: false, statusBarStyle: dark ? 'light' : 'dark' }}>
      <Stack.Screen name='index' />
      <Stack.Screen name='(tabs)' />
    </Stack>
  )
  if (Platform.OS !== 'web') return stack
  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      <View style={[styles.fill, screenShell]}>{stack}</View>
    </View>
  )
}

const RootLayout = () => {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 }
})

export default RootLayout
