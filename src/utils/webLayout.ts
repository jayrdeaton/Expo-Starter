import { Platform } from 'react-native'

// Native ignores this (Platform.select falls through to {}). It only shapes the web layout, where
// nothing constrains width the way a phone screen does, so a wide desktop window would otherwise
// stretch every screen edge to edge. 640 is the cap Solitaire's list screens use; Hangman's
// webLayout.ts has the same shape.
export const screenShell = Platform.select({ web: { alignSelf: 'center' as const, maxWidth: 640, width: '100%' as const }, default: {} })
