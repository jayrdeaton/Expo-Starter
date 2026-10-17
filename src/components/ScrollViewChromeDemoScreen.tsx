import { Switch } from '@rific/feedback-press'
import { FlatList, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider, useScrollViewChromePin } from '@rific/scroll-view'
import { useIsFocused } from 'expo-router'
import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

export type ScrollViewChromeDemoScreenProps = {
  items: string[]
  title: string
}

// One tab of the /demos/scroll-view-chrome example. Written exactly like any other scroll-view
// screen: nothing chrome-specific beyond the optional pin. It joins the ScrollViewChromeProvider in
// that route's _layout.tsx while focused, so its footer and the tab bar hide and reveal as one.
export const ScrollViewChromeDemoScreen = ({ items, title }: ScrollViewChromeDemoScreenProps) => {
  const theme = useTheme()
  const focused = useIsFocused()
  const [pinned, setPinned] = useState(false)
  // Pins are counted across the whole host, so only the focused tab's switch may hold one: a pin
  // left on a tab in the background would otherwise keep holding the bar on the other.
  useScrollViewChromePin(pinned && focused)

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <Surface elevation={0} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
          {item}
        </Text>
      </Surface>
    ),
    [theme]
  )

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} caption='ScrollViewChromeProvider' title={title} />
        <FlatList
          contentContainerStyle={styles.container}
          data={items}
          keyExtractor={(item) => item}
          ListHeaderComponent={
            <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
              Scroll down and the footer and tab bar hide together as one piece; scroll up a little and both come back. Tapping the tab you&apos;re on brings a half-hidden bar back up, and the switch below pins it in place.
            </Text>
          }
          renderItem={renderItem}
        />
        <ScrollViewFooter style={styles.footer}>
          <Text variant='bodyMedium'>Pin the tab bar</Text>
          <Switch accessibilityLabel='Pin the tab bar' value={pinned} onValueChange={setPinned} />
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  fill: { flex: 1 },
  footer: { justifyContent: 'space-between', paddingHorizontal: 16 },
  hint: { marginBottom: 12, paddingHorizontal: 8 },
  item: { borderRadius: 8, marginBottom: 8, padding: 16 }
})
