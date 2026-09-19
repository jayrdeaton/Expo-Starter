import { Drawer } from '@rific/drawer'
import { FeedbackPressProvider, hapticActions, type HapticSettings, soundActions, type SoundSettings, useFeedbackBridgeProps } from '@rific/feedback-press'
import { scrollViewActions, type ScrollViewSettings, ScrollViewSettingsProvider } from '@rific/scroll-view'
import { type HistoryContainerProps, HistoryModal, Toaster, ToastProvider, useUpdateErrorToast } from '@rific/toaster'
import { useUpdater } from '@rific/updater'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useMemo } from 'react'
import { useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import * as RNPaper from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { useDefaultSounds } from '@/hooks/sounds/useDefaultSounds'
import { persistor, type RootState, store } from '@/redux/store'

import { Theme } from './Theme'

export type ProvidersProps = { children: React.ReactNode }

const HistoryDrawerContainer = ({ children, onClose, visible }: HistoryContainerProps) => {
  const { height } = useWindowDimensions()
  return (
    <Drawer open={visible} onClose={onClose} side='bottom' height={height * 0.85}>
      {children}
    </Drawer>
  )
}

const FeedbackBridge = ({ children }: ProvidersProps) => {
  const haptic = useSelector((state: RootState) => state.haptic)
  const sound = useSelector((state: RootState) => state.sound)
  const dispatch = useDispatch()
  const onChange = useCallback((s: HapticSettings) => dispatch(hapticActions.initialize(s)), [dispatch])
  const onSoundChange = useCallback((s: SoundSettings) => dispatch(soundActions.initialize(s)), [dispatch])
  const { playClick, playPop } = useDefaultSounds()
  const soundConfig = useMemo(() => ({ selection: playClick, notification: playPop }), [playClick, playPop])
  const bridgeProps = useFeedbackBridgeProps({ initialValue: haptic, onChange, soundInitialValue: sound, onSoundChange, sound: soundConfig })
  return (
    <FeedbackPressProvider paper={RNPaper} {...bridgeProps}>
      {children}
    </FeedbackPressProvider>
  )
}

// Rendered inside ToastProvider (useUpdateErrorToast needs its context), which is why this lives
// here and not in _layout.tsx above Providers: a failed update check surfaces as an error toast
// instead of @rific/updater's default Alert.
const UpdateChecker = () => {
  const onError = useUpdateErrorToast()
  useUpdater({ onError })
  return null
}

const ScrollViewBridge = ({ children }: ProvidersProps) => {
  const scrollView = useSelector((state: RootState) => state.scrollView)
  const dispatch = useDispatch()
  const onChange = useCallback((settings: ScrollViewSettings) => dispatch(scrollViewActions.initialize(settings)), [dispatch])
  return (
    <ScrollViewSettingsProvider onChange={onChange} initialValue={scrollView}>
      {children}
    </ScrollViewSettingsProvider>
  )
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PersistGate persistor={persistor}>
            <FeedbackBridge>
              <ScrollViewBridge>
                <KeyboardProvider>
                  <Theme>
                    <ToastProvider haptics={Haptics} paper={RNPaper}>
                      <UpdateChecker />
                      {children}
                      <Toaster historyModal={<HistoryModal Container={HistoryDrawerContainer} />} />
                    </ToastProvider>
                  </Theme>
                </KeyboardProvider>
              </ScrollViewBridge>
            </FeedbackBridge>
          </PersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
