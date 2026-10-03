import * as AutoPaper from '@rific/auto-paper'
import { Drawer, DrawerProvider } from '@rific/drawer'
import { FeedbackPressProvider, hapticActions, type HapticSettings, soundActions, type SoundSettings, useFeedbackBridgeProps } from '@rific/feedback-press'
import { scrollViewActions, type ScrollViewSettings, ScrollViewSettingsProvider } from '@rific/scroll-view'
import { type HistoryContainerProps, HistoryModal, Toaster, ToastProvider, useUpdateErrorToast } from '@rific/toaster'
import { useUpdater } from '@rific/updater'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useEffect, useMemo } from 'react'
import { BackHandler, useWindowDimensions } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import * as RNPaper from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import { useProviderSounds } from '@/hooks/sounds/useDefaultSounds'
import { persistor, type RootState, store } from '@/redux/store'

import { Theme } from './Theme'

export type ProvidersProps = { children: React.ReactNode }

// Swaps @rific/toaster's default Modal container for a bottom sheet. A bare Drawer has none of the
// Modal's Android back handling (closeOnBackPress only exists on createDrawer()'s
// DrawerInstanceProvider), so it's wired up here instead. blur={false}: the history content paints
// its own opaque surface, so a BlurView behind it would never be seen.
const HistoryDrawerContainer = ({ children, onClose, visible }: HistoryContainerProps) => {
  const { height } = useWindowDimensions()

  useEffect(() => {
    if (!visible) return

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose()
      return true
    })
    return () => subscription.remove()
  }, [onClose, visible])

  return (
    <Drawer blur={false} open={visible} onClose={onClose} side='bottom' height={height * 0.85}>
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
  const { playClick, playPop } = useProviderSounds()
  const soundConfig = useMemo(() => ({ selection: playClick, notification: playPop }), [playClick, playPop])
  const bridgeProps = useFeedbackBridgeProps({ initialValue: haptic, onChange, soundInitialValue: sound, onSoundChange, sound: soundConfig })
  return (
    <FeedbackPressProvider paper={RNPaper} {...bridgeProps}>
      {children}
    </FeedbackPressProvider>
  )
}

// Rendered inside ToastProvider (useUpdateErrorToast needs its context), which is why this lives
// here and not in _layout.tsx above Providers. Routes the updater's onError to an error toast
// instead of @rific/updater's default Alert. This instance never calls check(), so in practice that
// means a failed confirm/reload during the auto-prompt; failed background checks are silent by design.
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
      <DrawerProvider autoPaper={AutoPaper}>
        <SafeAreaProvider>
          <ReduxProvider store={store}>
            <PersistGate persistor={persistor}>
              <FeedbackBridge>
                <ScrollViewBridge>
                  <KeyboardProvider>
                    <Theme>
                      <ToastProvider haptics={Haptics} paper={RNPaper}>
                        {/* Portal content (Dialog, Menu, ...) mounts at the nearest Portal.Host, so
                            without this one it would land at auto-paper's, above ToastProvider, and
                            useToast/useUpdateErrorToast would throw inside it. Toaster stays outside:
                            its own portaled stack then mounts at that outer host, which draws above
                            everything here, so a toast fired from a dialog shows on top of it. */}
                        <RNPaper.Portal.Host>
                          <UpdateChecker />
                          {children}
                        </RNPaper.Portal.Host>
                        <Toaster historyModal={<HistoryModal Container={HistoryDrawerContainer} />} />
                      </ToastProvider>
                    </Theme>
                  </KeyboardProvider>
                </ScrollViewBridge>
              </FeedbackBridge>
            </PersistGate>
          </ReduxProvider>
        </SafeAreaProvider>
      </DrawerProvider>
    </GestureHandlerRootView>
  )
}
