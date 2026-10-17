import { Platform } from 'react-native'

// Whether this device can vibrate: always on native. On web, @rific/feedback-press's useVibration
// only calls expo-haptics on iOS; everywhere else it uses React Native's Vibration, which
// react-native-web maps to navigator.vibrate. iOS browsers don't have that, and desktop Chrome has
// it with no motor behind it, so on web only a touch device that has it (Chrome on Android) buzzes.
export const hapticsSupported = Platform.OS !== 'web' || (typeof navigator !== 'undefined' && 'vibrate' in navigator && typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches === true)
