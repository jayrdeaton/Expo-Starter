import { useThemeSettings } from '@rific/auto-paper'
import { AppbarAction, Button, Chip, Switch } from '@rific/feedback-press'
import { defaultScrollViewSettings, PullSearch, type PullSearchHandle, ScrollView, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider, useScrollView, useScrollViewSettings } from '@rific/scroll-view'
import { useRouter } from 'expo-router'
import { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const ACTION_SIZES = [32, 40, 48] as const

const ProgressControls = () => {
  const { setProgress, setProgressing } = useScrollView()
  return (
    <View style={styles.progressRow}>
      <Button
        compact
        mode='outlined'
        onPress={() => {
          setProgressing(true)
          setProgress(null)
        }}
      >
        Indeterminate
      </Button>
      <Button
        compact
        mode='outlined'
        onPress={() => {
          setProgressing(true)
          setProgress(0.6)
        }}
      >
        60%
      </Button>
      <Button
        compact
        mode='outlined'
        onPress={() => {
          setProgressing(false)
          setProgress(null)
        }}
      >
        Clear
      </Button>
    </View>
  )
}

const ScrollViewDemo = () => {
  const router = useRouter()
  const theme = useTheme()
  const {
    settings: { blur },
    set: setTheme
  } = useThemeSettings()
  const { settings, set } = useScrollViewSettings()

  const [pullSearchHeight, setPullSearchHeight] = useState(0)
  const searchRef = useRef<PullSearchHandle>(null)
  const handleChangeText = useCallback(() => {}, [])
  const pullSearch = useMemo(() => <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Example pull search…' ref={searchRef} />, [handleChangeText])

  const [fixed, setFixed] = useState(false)
  const [showCaption, setShowCaption] = useState(true)
  const [actionSize, setActionSize] = useState<32 | 40 | 48>(48)
  const [showTrailing, setShowTrailing] = useState(false)
  const [trailingActionFixed, setTrailingActionFixed] = useState(true)

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider fixed={fixed}>
        <ScrollViewHeader actionSize={actionSize} backAction={safeBack} caption={showCaption ? '@rific/scroll-view' : undefined} title='Scroll View' trailingAction={showTrailing ? <AppbarAction accessibilityLabel='Toggle header fixed' icon={settings.headerFixed ? 'lock' : 'lock-open-outline'} onPress={() => set({ headerFixed: !settings.headerFixed })} /> : undefined} trailingActionFixed={trailingActionFixed} />
        <ScrollView contentContainerStyle={styles.container} pullSearchHeight={pullSearchHeight}>
          {pullSearch}

          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Floating blur header and footer with scroll-away animation, keyboard-aware scroll, and progress bar.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            App Settings
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            App-wide and persisted: every scroll-view screen falls back to these, and they survive an app restart. Header fixed and Footer fixed dim while Both fixed (below) overrides them on this screen. Apart from Blur and the header&apos;s lock button, the rest of this screen&apos;s toggles only affect this screen.
          </Text>
          <View style={[styles.row, fixed && styles.dimmed]}>
            <Text variant='bodyMedium'>Header fixed</Text>
            <Switch accessibilityLabel='Header fixed' value={settings.headerFixed} onValueChange={(v) => set({ headerFixed: v })} disabled={fixed} />
          </View>
          <View style={[styles.row, fixed && styles.dimmed]}>
            <Text variant='bodyMedium'>Footer fixed</Text>
            <Switch accessibilityLabel='Footer fixed' value={settings.footerFixed} onValueChange={(v) => set({ footerFixed: v })} disabled={fixed} />
          </View>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Back fixed</Text>
            <Switch accessibilityLabel='Back fixed' value={settings.backActionFixed} onValueChange={(v) => set({ backActionFixed: v })} />
          </View>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Snap back brings the header and/or footer back into view immediately on scroll up. Header only and Footer only turn it on for one side while Snap back (both) is off.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Snap back (both)</Text>
            <Switch accessibilityLabel='Snap back (both)' value={settings.snapBack} onValueChange={(v) => set({ snapBack: v })} />
          </View>
          <View style={[styles.row, settings.snapBack && styles.dimmed]}>
            <Text variant='bodyMedium'>Header only</Text>
            <Switch accessibilityLabel='Header only' value={settings.snapBackHeader ?? false} onValueChange={(v) => set({ snapBackHeader: v || undefined })} disabled={settings.snapBack} />
          </View>
          <View style={[styles.row, settings.snapBack && styles.dimmed]}>
            <Text variant='bodyMedium'>Footer only</Text>
            <Switch accessibilityLabel='Footer only' value={settings.snapBackFooter ?? false} onValueChange={(v) => set({ snapBackFooter: v || undefined })} disabled={settings.snapBack} />
          </View>
          <Button mode='outlined' onPress={() => set({ ...defaultScrollViewSettings, snapBackFooter: undefined, snapBackHeader: undefined })}>
            Reset to defaults
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Header & Footer
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            When not fixed, the header and footer scroll away with the content. Both fixed pins them on this screen only, overriding Header fixed and Footer fixed above.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Both fixed</Text>
            <Switch accessibilityLabel='Both fixed' value={fixed} onValueChange={setFixed} />
          </View>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Caption</Text>
            <Switch accessibilityLabel='Caption' value={showCaption} onValueChange={setShowCaption} />
          </View>
          <Text variant='bodySmall' style={[styles.chipLabel, { color: theme.colors.onSurfaceVariant }]}>
            Action size
          </Text>
          <View style={styles.chips}>
            {ACTION_SIZES.map((s) => (
              <Chip key={s} selected={actionSize === s} onPress={() => setActionSize(s)}>
                {s}
              </Chip>
            ))}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Blur
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {'Applies a blur backdrop to the header and footer chrome on iOS and web (Android keeps the solid chrome). Powered by '}
            <Text variant='bodySmall' style={{ color: theme.colors.primary }} onPress={() => router.push('/demos/auto-paper')}>
              @rific/auto-paper
            </Text>
            {'. Toggle here affects all scroll-view screens.'}
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Blur enabled</Text>
            <Switch accessibilityLabel='Blur enabled' value={blur} onValueChange={(v) => setTheme({ blur: v })} />
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Actions
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Back and trailing action slots. When not fixed, each scrolls away with the header (Back fixed is in App Settings above). The trailing slot here holds a lock that toggles the Header fixed app setting.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Show trailing</Text>
            <Switch accessibilityLabel='Show trailing' value={showTrailing} onValueChange={setShowTrailing} />
          </View>
          <View style={[styles.row, !showTrailing && styles.dimmed]}>
            <Text variant='bodyMedium'>Trailing fixed</Text>
            <Switch accessibilityLabel='Trailing fixed' value={trailingActionFixed} onValueChange={setTrailingActionFixed} disabled={!showTrailing} />
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Progress Bar
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Drives the progress bar on the header chrome.
          </Text>
          <ProgressControls />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Pull Search
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Pull down past the header to reveal a search bar. Try it on this screen and in the Flat List, Section List, Custom List, Grid, and Flash List examples below. Pull-to-reveal is iOS-only; on Android and web the bar stays visible at the top of the list.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Flat List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Standard flat list with pull-to-search and blur chrome.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-flat-list')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Section List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Grouped list with sticky blur headers and pull-to-search.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-section-list')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Horizontal List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Full-page horizontal pager. Header and footer are automatically fixed; a Start chip replaces the Top chip.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-horizontal')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Custom List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Bring your own list component with pull-to-search, sort filters, and a centerContent segmented control.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-custom-list')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Grid / Columns
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Toggles numColumns between a single-column list and a 3-column grid at runtime. scroll-view&apos;s FlatList groups the items into rows itself and always hands React Native&apos;s FlatList a single column, so changing numColumns needs no key remount.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-grid')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Flash List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            @shopify/flash-list v2 via CustomList, with the same pull-to-search and blur chrome. v2 measures items itself, so no item-size estimate is needed.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-flash-list')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Keyboard Aware
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Adds the keyboard height to the bottom content inset so focused fields stay visible above the keyboard. Native only, no effect on web.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-keyboard')}>
            Open example
          </Button>
        </ScrollView>
        <ScrollViewFooter style={styles.footer}>
          <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            @rific/scroll-view
          </Text>
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  chipLabel: { marginBottom: 8, marginTop: 4 },
  chips: { flexDirection: 'row', gap: 8 },
  container: { paddingHorizontal: 16 },
  desc: { marginTop: 16 },
  dimmed: { opacity: 0.4 },
  divider: { marginVertical: 20 },
  fill: { flex: 1 },
  footer: { flex: 1, justifyContent: 'center' },
  hint: { marginBottom: 12 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { marginBottom: 8 }
})

export default ScrollViewDemo
