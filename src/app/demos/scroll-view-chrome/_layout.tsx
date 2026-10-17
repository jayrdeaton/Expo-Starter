import { TouchableRipple } from '@rific/feedback-press'
import { ScrollViewChromeProvider, useScrollViewChromeReveal, useScrollViewChromeStyle } from '@rific/scroll-view'
import { useIsFocused } from 'expo-router'
import { type BottomTabBarProps, Tabs } from 'expo-router/tabs'
import { StyleSheet, View } from 'react-native'
import { Icon, Text, useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// The bar's own row, above the bottom safe-area inset. footprint below is this plus the inset: the
// bar's exact resting height, which every hosted ScrollViewFooter is lifted by.
const TAB_ROW = 64

const TABS: Record<string, { icon: string; label: string }> = {
  index: { icon: 'food-apple-outline', label: 'Fruits' },
  vegetables: { icon: 'carrot', label: 'Vegetables' }
}

// A tab bar this app draws itself, absolutely positioned over the screen's bottom, so it can move:
// useScrollViewChromeStyle() is the shared offset that hides and reveals it in lockstep with the
// focused screen's ScrollViewFooter, as one piece.
const TabBar = ({ navigation, state }: BottomTabBarProps) => {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const chromeStyle = useScrollViewChromeStyle()
  const reveal = useScrollViewChromeReveal()

  return (
    <Animated.View style={[styles.bar, { backgroundColor: theme.colors.elevation.level2, borderTopColor: theme.colors.outlineVariant, height: TAB_ROW + insets.bottom, paddingBottom: insets.bottom }, chromeStyle]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index
        const tab = TABS[route.name] ?? { icon: 'circle-outline', label: route.name }
        const color = focused ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant
        return (
          <TouchableRipple
            key={route.key}
            accessibilityLabel={tab.label}
            accessibilityRole='tab'
            accessibilityState={{ selected: focused }}
            style={styles.tab}
            onPress={() => {
              navigation.navigate(route.name)
              // Tapping the tab you're already on brings a hidden bar back.
              if (focused) reveal()
            }}
          >
            <View style={styles.tabContent}>
              <View style={[styles.indicator, focused && { backgroundColor: theme.colors.secondaryContainer }]}>
                <Icon color={color} size={24} source={tab.icon} />
              </View>
              <Text variant='labelMedium' style={{ color: focused ? theme.colors.onSurface : theme.colors.onSurfaceVariant }}>
                {tab.label}
              </Text>
            </View>
          </TouchableRipple>
        )
      })}
    </Animated.View>
  )
}

// ScrollViewChromeProvider hosts the bar above the navigator. Each tab's screen is an ordinary
// ScrollViewProvider screen that joins the host while it's focused (useIsFocused, since Tabs keeps
// visited screens mounted). backBehavior='none': the header's back button leaves the demo from
// either tab instead of first switching back to Fruits.
const ScrollViewChromeLayout = () => {
  const insets = useSafeAreaInsets()
  return (
    <ScrollViewChromeProvider footprint={TAB_ROW + insets.bottom} useIsActive={useIsFocused}>
      <Tabs backBehavior='none' screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />} />
    </ScrollViewChromeProvider>
  )
}

const styles = StyleSheet.create({
  bar: { borderTopWidth: StyleSheet.hairlineWidth, bottom: 0, flexDirection: 'row', left: 0, position: 'absolute', right: 0 },
  indicator: { alignItems: 'center', borderRadius: 16, height: 32, justifyContent: 'center', width: 64 },
  tab: { flex: 1, height: TAB_ROW },
  tabContent: { alignItems: 'center', flex: 1, gap: 4, justifyContent: 'center' }
})

export default ScrollViewChromeLayout
