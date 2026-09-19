import * as AutoPaper from '@rific/auto-paper'
import { combineDrawerProviders, createDrawer, DrawerProvider } from '@rific/drawer'
import { Button, IconButton, Switch } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, List, Surface, Text, useTheme } from 'react-native-paper'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { safeBack } from '@/utils/navigation'

const nav = createDrawer({ side: 'left', width: 280 })
// blur: true here demonstrates @rific/auto-paper's BlurView on the panel surface, see the
// <DrawerProvider autoPaper={AutoPaper}> wrapping DrawerDemoPage below, which is what actually
// makes that render as a real blur instead of the solid-fill fallback.
const settings = createDrawer({ side: 'right', width: 300, blur: true })
const sheet = createDrawer({ side: 'bottom', height: 220, contentSize: true })
// height/maxHeight (and width/maxWidth for left/right) accept a percentage string, resolved
// against the window size. Opens to half the screen; maxHeight lets the handle drag it open the
// rest of the way, past its rest size, instead of just toggling open/closed.
const expandableSheet = createDrawer({ side: 'bottom', height: '50%', maxHeight: '100%' })

// The panel itself renders edge-to-edge on purpose (see @rific/drawer's README): insetting for
// the notch/home indicator is this content's own call, same as any other screen would make.
const NavDrawerContent = () => {
  const { close } = nav.useDrawer()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.colors.surface, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.drawerHeader}>
        <Text variant='titleMedium'>Navigate</Text>
        <IconButton icon='close' onPress={close} accessibilityLabel='Close' />
      </View>
      <List.Item title='Home' left={(props) => <List.Icon {...props} icon='home-outline' />} onPress={close} />
      <List.Item title='Explore' left={(props) => <List.Icon {...props} icon='compass-outline' />} onPress={close} />
      <List.Item title='Favorites' left={(props) => <List.Icon {...props} icon='heart-outline' />} onPress={close} />
    </View>
  )
}

const SettingsDrawerContent = () => {
  const { close } = settings.useDrawer()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  return (
    <View style={[styles.drawerContent, { backgroundColor: theme.colors.surface, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.drawerHeader}>
        <Text variant='titleMedium'>Settings</Text>
        <IconButton icon='close' onPress={close} accessibilityLabel='Close' />
      </View>
      <List.Item title='Dark mode' right={() => <Switch value={darkMode} onValueChange={setDarkMode} />} />
      <List.Item title='Notifications' right={() => <Switch value={notifications} onValueChange={setNotifications} />} />
    </View>
  )
}

const SheetContent = () => {
  const { close } = sheet.useDrawer()
  const theme = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.sheetContent, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.drawerHeader}>
        <Text variant='titleMedium'>Bottom sheet</Text>
        <IconButton icon='close' onPress={close} accessibilityLabel='Close' />
      </View>
      <Text variant='bodyMedium' style={[styles.sheetHint, { color: theme.colors.onSurfaceVariant }]}>
        Same createDrawer() call, side: &apos;bottom&apos; instead of &apos;left&apos;/&apos;right&apos;. contentSize sizes the sheet to this text instead of a fixed height, so it grows/shrinks with the content.
      </Text>
    </View>
  )
}

const ExpandableSheetContent = () => {
  const { close, expandProgress } = expandableSheet.useDrawer()
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  // The top safe-area inset (status bar/notch) only matters once the sheet is actually reaching the
  // screen's top edge — wasted space while merely resting at 50%. expandProgress (0 at rest, 1 once
  // fully expanded) scales it in smoothly as the handle is dragged, instead of either always paying
  // for it or snapping it in abruptly right at the end. The bottom inset doesn't need this: the
  // sheet's bottom edge sits flush against the screen's bottom at any size, rest or expanded, so it
  // stays a plain, unconditional value below.
  const topInsetStyle = useAnimatedStyle(() => ({ paddingTop: 16 + expandProgress.value * insets.top }))

  return (
    <Animated.View style={[styles.drawerContent, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom }, topInsetStyle]}>
      <View style={styles.drawerHeader}>
        <Text variant='titleMedium'>Expandable sheet</Text>
        <IconButton icon='close' onPress={close} accessibilityLabel='Close' />
      </View>
      <Text variant='bodyMedium' style={[styles.sheetHint, { color: theme.colors.onSurfaceVariant }]}>
        height: &apos;50%&apos;, maxHeight: &apos;100%&apos;. Opens to half the screen; drag the handle above up to pull it open the rest of the way, or down to dismiss, same commit-past-a-third rule either direction.
      </Text>
      <List.Item title='Drag the handle up' description='Past a third of the way there, or a fast flick, commits to fully open; otherwise it springs back to rest.' left={(props) => <List.Icon {...props} icon='drag-horizontal' />} />
      <List.Item title='Only visible once expanded' description='The panel always renders at maxHeight; at rest most of it just sits off-screen below.' left={(props) => <List.Icon {...props} icon='arrow-expand-vertical' />} />
      <List.Item title='Percentage or plain numbers' description="height/maxHeight (and width/maxWidth) both take either — this sheet's 50%/100% could just as well be 300/800." left={(props) => <List.Icon {...props} icon='percent-outline' />} />
      <List.Item title='Safe-area top inset, only when it matters' description='The status bar/notch inset fades in as you drag toward fully open, via expandProgress from useDrawer() — no wasted padding at rest.' left={(props) => <List.Icon {...props} icon='cellphone-arrow-down' />} />
    </Animated.View>
  )
}

const AllDrawersProvider = combineDrawerProviders([nav.DrawerInstanceProvider, { content: <NavDrawerContent /> }], [settings.DrawerInstanceProvider, { content: <SettingsDrawerContent /> }], [sheet.DrawerInstanceProvider, { content: <SheetContent /> }], [expandableSheet.DrawerInstanceProvider, { content: <ExpandableSheetContent /> }])

const FEATURES = [
  'Spring-animated sliding panel with a tap-to-dismiss backdrop',
  'Opens by calling open(), or by swiping in from the screen edge',
  'Slides in from any of the four edges: left/right for a drawer, top/bottom for a bottom sheet, same mechanism either way, so one package covers both (no separate bottom-sheet dependency needed)',
  'One createDrawer() call per instance: a left nav drawer, a right settings drawer, and a bottom sheet all stay fully independent',
  'combineDrawerProviders() flattens nesting multiple drawers into a single wrapper',
  'contentSize sizes the panel to its content along the main axis instead of a fixed width/height, and animates smoothly if that size changes',
  'width/height accept a percentage string, resolved against the window size, instead of a plain pixel number',
  'maxHeight/maxWidth turn the panel into an expandable sheet: opens to width/height as usual, but the same drag handle can pull it open further, up to this ceiling, instead of just toggling open/closed',
  'useDrawer() exposes expandProgress, a live 0-1 SharedValue tracking how expanded the sheet currently is, for content that should only react once the panel is genuinely at its full extent (see the expandable sheet below)',
  'Built-in swipe-to-dismiss drag handle on the panel edge closest to closed, floating just outside the panel rather than claiming space inside it',
  'Theme-aware: reads its surface color from react-native-paper, with an optional blurred surface via @rific/auto-paper, configured once via configureDrawer()/<DrawerProvider>, not auto-detected (see the settings drawer below)',
  'enabled prop to temporarily suppress the edge-swipe gesture',
  'Panel renders edge-to-edge, deliberately. Pad your own content with useSafeAreaInsets() (as this demo does), so it never conflicts with a safe-area-aware header you may already be using'
]

const PROPS = [
  { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", desc: "Which edge the drawer anchors to and swipes in from. Default: 'left'." },
  { name: 'width / height', type: "number | '${number}%'", desc: 'Panel size along the main axis: width for left/right, height for top/bottom. A percentage resolves against the window size. Default: 300.' },
  { name: 'maxWidth / maxHeight', type: "number | '${number}%'", desc: "Turns the panel into an expandable sheet: the drag handle can pull it open past width/height, up to this ceiling. Omit for today's plain open/closed toggle." },
  { name: 'expandProgress', type: 'SharedValue<number>', desc: "useDrawer()'s own field, not a createDrawer() option: 0 at rest, 1 fully expanded, live as the handle drags or springs. Always 1 without maxHeight/maxWidth." },
  { name: 'contentSize', type: 'boolean', desc: 'Sizes the panel to its content instead of a fixed width/height. Default: false.' },
  { name: 'content', type: 'ReactNode', desc: "The DrawerInstanceProvider's own prop: what renders inside the sliding panel." },
  { name: 'dismissible / showHandle', type: 'boolean', desc: 'Whether the drag handle renders and can be swiped to dismiss. Both default: true.' },
  { name: 'blockingBackdrop / backdropOpacity', type: 'boolean / number', desc: 'Whether the backdrop intercepts touches, and how dark it gets at full open. Defaults: true / 0.45.' },
  { name: 'blur', type: 'boolean', desc: "Blurred panel surface via @rific/auto-paper's BlurView, instead of a solid one." },
  { name: 'zIndex', type: 'number', desc: 'Stacking tier when more than one drawer can be open at once. Default: 50.' },
  { name: 'enabled', type: 'boolean', desc: 'Suppresses the edge-swipe gesture when false, without touching open()/close(). Default: true.' }
]

const USAGE = `import * as AutoPaper from '@rific/auto-paper'
import { createDrawer, combineDrawerProviders, DrawerProvider } from '@rific/drawer'

const nav = createDrawer({ side: 'left', width: 300 })
const settings = createDrawer({ side: 'right', width: 320, blur: true })
const sheet = createDrawer({ side: 'bottom', contentSize: true }) // replaces a standalone bottom-sheet lib
// opens to half the screen; the drag handle can pull it open the rest of the way
const expandableSheet = createDrawer({ side: 'bottom', height: '50%', maxHeight: '100%' })

const AllDrawersProvider = combineDrawerProviders(
  [nav.DrawerInstanceProvider, { content: <AppDrawerContent /> }],
  [settings.DrawerInstanceProvider, { content: <SettingsDrawerContent /> }],
  [sheet.DrawerInstanceProvider, { content: <SheetContent /> }],
  [expandableSheet.DrawerInstanceProvider, { content: <ExpandableSheetContent /> }]
)

// once, near the app root (inside GestureHandlerRootView), configures @rific/auto-paper's
// BlurView for every Drawer with blur: true; omit this and they fall back to a solid surface
<DrawerProvider autoPaper={AutoPaper}>
  <AllDrawersProvider>
    <RootNavigator />
  </AllDrawersProvider>
</DrawerProvider>

// anywhere else:
const { isOpen, open, close } = nav.useDrawer()
<IconButton icon="menu" onPress={open} />`

// Rendered as AllDrawersProvider's child (not its parent) so nav.useDrawer()/settings.useDrawer()
// actually resolve the real Provider values instead of the no-op default context.
const DrawerDemoContent = () => {
  const theme = useTheme()
  const navDrawer = nav.useDrawer()
  const settingsDrawer = settings.useDrawer()
  const sheetDrawer = sheet.useDrawer()
  const expandableSheetDrawer = expandableSheet.useDrawer()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='@rific/drawer' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='headlineSmall'>Drawer</Text>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Sliding drawer/sheet with edge-swipe gestures. left/right for a drawer, top/bottom for a bottom sheet, same package handles both.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Try it
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Tap a button below, or swipe in from the left/right screen edge or up from the bottom.
          </Text>
          <View style={styles.row}>
            <Button mode='contained' icon='menu' onPress={navDrawer.open}>
              Open nav drawer
            </Button>
            <Button mode='contained' icon='cog-outline' onPress={settingsDrawer.open}>
              Open settings drawer
            </Button>
            <Button mode='contained' icon='dock-bottom' onPress={sheetDrawer.open}>
              Open bottom sheet
            </Button>
            <Button mode='contained' icon='arrow-expand-vertical' onPress={expandableSheetDrawer.open}>
              Open expandable sheet
            </Button>
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Features
          </Text>
          {FEATURES.map((f) => (
            <View key={f} style={styles.bullet}>
              <Text style={{ color: theme.colors.primary }}>•</Text>
              <Text variant='bodyMedium' style={[styles.fill, { color: theme.colors.onSurfaceVariant }]}>
                {f}
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Key Props
          </Text>
          <Surface style={[styles.apiCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            {PROPS.map((prop, i) => (
              <View key={prop.name} style={[styles.apiItem, i === 0 && styles.apiItemFirst]}>
                <View style={styles.propRow}>
                  <Text style={[styles.code, { color: theme.colors.primary }]}>{prop.name}</Text>
                  <Text style={[styles.code, styles.propType, { color: theme.colors.secondary }]}>{prop.type}</Text>
                </View>
                <Text variant='bodySmall' style={[styles.propDesc, { color: theme.colors.onSurfaceVariant }]}>
                  {prop.desc}
                </Text>
              </View>
            ))}
          </Surface>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Usage
          </Text>
          <Surface style={[styles.codeBlock, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text style={[styles.code, { color: theme.colors.onSurfaceVariant }]}>{USAGE}</Text>
          </Surface>
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

// autoPaper configured here (rather than globally in Providers.tsx) since Drawer is only used
// on this one screen: configureDrawer()/<DrawerProvider> is one-time app-wide setup, but
// "app-wide" just means "wherever your Drawers actually live," not necessarily the root.
const DrawerDemoPage = () => (
  <DrawerProvider autoPaper={AutoPaper}>
    <AllDrawersProvider>
      <DrawerDemoContent />
    </AllDrawersProvider>
  </DrawerProvider>
)

const styles = StyleSheet.create({
  apiCard: { borderRadius: 12 },
  apiItem: {
    borderTopColor: 'rgba(128,128,128,0.2)',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16
  },
  apiItemFirst: { borderTopWidth: 0 },
  bullet: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    lineHeight: 20
  },
  codeBlock: { borderRadius: 12, padding: 16 },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 8 },
  divider: { marginVertical: 20 },
  drawerContent: { flex: 1, paddingTop: 8 },
  drawerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  fill: { flex: 1 },
  hint: { marginBottom: 12 },
  propDesc: { marginTop: 2 },
  propRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  propType: { marginLeft: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionLabel: { marginBottom: 12 },
  sheetContent: { paddingTop: 8 },
  sheetHint: { paddingHorizontal: 16 }
})

export default DrawerDemoPage
