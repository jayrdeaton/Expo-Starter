import { useThemeSettings } from '@rific/auto-paper'
import { AppbarAction, Button, Chip, Switch } from '@rific/feedback-press'
import { PullSearch, type PullSearchHandle, ScrollView, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider, useScrollView, useScrollViewSettings } from '@rific/scroll-view'
import { Stack, useRouter } from 'expo-router'
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
  const pullSearch = useMemo(() => <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Example pull search...' ref={searchRef} />, [handleChangeText])

  const [fixed, setFixed] = useState(false)
  const [showCaption, setShowCaption] = useState(true)
  const [actionSize, setActionSize] = useState<32 | 40 | 48>(48)
  const [showTrailing, setShowTrailing] = useState(false)
  const [trailingActionFixed, setTrailingActionFixed] = useState(true)

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider fixed={fixed}>
        <ScrollViewHeader actionSize={actionSize} backAction={safeBack} caption={showCaption ? '@rific/scroll-view' : undefined} title='Scroll View' trailingAction={showTrailing ? <AppbarAction icon={settings.headerFixed ? 'lock' : 'lock-open-outline'} onPress={() => set({ headerFixed: !settings.headerFixed })} /> : undefined} trailingActionFixed={trailingActionFixed} />
        <ScrollView contentContainerStyle={styles.container} pullSearchHeight={pullSearchHeight}>
          {pullSearch}

          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Floating blur header and footer with scroll-away animation, keyboard-aware scroll, and progress bar.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Header & Footer
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            When not fixed, the header and footer scroll away with the content.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Both fixed</Text>
            <Switch value={fixed} onValueChange={setFixed} />
          </View>
          <View style={[styles.row, fixed && styles.dimmed]}>
            <Text variant='bodyMedium'>Header fixed</Text>
            <Switch value={settings.headerFixed} onValueChange={(v) => set({ headerFixed: v })} disabled={fixed} />
          </View>
          <View style={[styles.row, fixed && styles.dimmed]}>
            <Text variant='bodyMedium'>Footer fixed</Text>
            <Switch value={settings.footerFixed} onValueChange={(v) => set({ footerFixed: v })} disabled={fixed} />
          </View>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Caption</Text>
            <Switch value={showCaption} onValueChange={setShowCaption} />
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
            {'Applies a blur backdrop to the header and footer chrome. Powered by '}
            <Text variant='bodySmall' style={{ color: theme.colors.primary }} onPress={() => router.push('/demos/auto-paper')}>
              @rific/auto-paper
            </Text>
            {'. Toggle here affects all scroll-view screens.'}
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Blur enabled</Text>
            <Switch value={blur} onValueChange={(v) => setTheme({ blur: v })} />
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Actions
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Back and trailing action slots. When not fixed, both scroll away with the header.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Back fixed</Text>
            <Switch value={settings.backActionFixed} onValueChange={(v) => set({ backActionFixed: v })} />
          </View>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Show trailing</Text>
            <Switch value={showTrailing} onValueChange={setShowTrailing} />
          </View>
          <View style={[styles.row, !showTrailing && styles.dimmed]}>
            <Text variant='bodyMedium'>Trailing fixed</Text>
            <Switch value={trailingActionFixed} onValueChange={setTrailingActionFixed} disabled={!showTrailing} />
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Snap Back
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Snaps the header and/or footer back into view immediately on scroll up. Individual overrides take precedence over both.
          </Text>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Snap back (both)</Text>
            <Switch value={settings.snapBack} onValueChange={(v) => set({ snapBack: v })} />
          </View>
          <View style={[styles.row, settings.snapBack && styles.dimmed]}>
            <Text variant='bodyMedium'>Header only</Text>
            <Switch value={settings.snapBackHeader ?? false} onValueChange={(v) => set({ snapBackHeader: v || undefined })} disabled={settings.snapBack} />
          </View>
          <View style={[styles.row, settings.snapBack && styles.dimmed]}>
            <Text variant='bodyMedium'>Footer only</Text>
            <Switch value={settings.snapBackFooter ?? false} onValueChange={(v) => set({ snapBackFooter: v || undefined })} disabled={settings.snapBack} />
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
            Pull down past the header to reveal a search bar. Available in Flat List, Section List, and Custom List below.
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
            Toggles numColumns between a single-column list and a 3-column grid via a key remount, a repro bed for the header/offset remount bug.
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/scroll-view-grid')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Flash List
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {'@shopify/flash-list via CustomList, same pull-to-search and blur chrome, virtualized with '}
            <Text variant='bodySmall' style={styles.monospaceText}>
              estimatedItemSize
            </Text>
            {'.'}
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
  monospaceText: { fontFamily: 'monospace' },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel: { marginBottom: 8 }
})

export default ScrollViewDemo
