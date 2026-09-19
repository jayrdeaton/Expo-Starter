import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Provider, themeActions, type ThemeSettings, useThemeBridgeProps } from '@rific/auto-paper'
import * as ExpoBlur from 'expo-blur'
import { useFonts } from 'expo-font'
import { type ReactNode, useCallback } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'

import { type RootState } from '@/redux/store'
import { markSplashReady, useSplashReady } from '@/utils/splashGate'

export type ThemeProps = {
  children: ReactNode
}

export const Theme = ({ children }: ThemeProps) => {
  const settings = useSelector((state: RootState) => state.theme, shallowEqual)
  const dispatch = useDispatch()
  const onChange = useCallback((s: ThemeSettings) => dispatch(themeActions.initialize(s)), [dispatch])
  // A one-shot callback, not a boolean, so there's nothing for useSplashReady to watch. This marks
  // the 'theme' gate (see src/utils/splashGate.ts) directly instead.
  const onReady = useCallback(() => markSplashReady('theme'), [])
  // Any react-native-paper component with a string icon prop (Appbar.Action, Button icon=, etc.,
  // see the demo screens under src/app/demos for examples) renders through this exact font, which
  // @expo/vector-icons doesn't preload: each Icon instance mounts blank and independently kicks
  // off its own Font.loadAsync, swapping in the real glyph only once that resolves. Loading it here
  // and marking the 'fonts' gate ready only once it resolves means every icon this app will ever
  // show is already loaded by the time the splash lifts, instead of popping in a beat later.
  const [fontsLoaded] = useFonts(MaterialCommunityIcons.font)
  useSplashReady('fonts', fontsLoaded)

  const bridgeProps = useThemeBridgeProps({ initialValue: settings, onChange, onReady })

  return (
    <Provider expoBlur={ExpoBlur} {...bridgeProps}>
      {children}
    </Provider>
  )
}
