import type { ReactNode } from 'react'
import { Platform, type StyleProp, type TextStyle } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

type WebNoteProps = {
  children: ReactNode
  style?: StyleProp<TextStyle>
  // Defaults to "on web". Pass it for a feature only some browsers lack, like haptics.
  visible?: boolean
}

// Shown next to a demo control that's turned off on web because its feature needs iOS or Android,
// so the web build says why instead of looking broken.
export const WebNote = ({ children, style, visible = Platform.OS === 'web' }: WebNoteProps) => {
  const theme = useTheme()
  if (!visible) return null
  return (
    <Text variant='bodySmall' style={[{ color: theme.colors.error }, style]}>
      {children}
    </Text>
  )
}
