import { AppbarAction, Button, Card, Checkbox, Chip, FAB, IconButton, SegmentedButtons, Switch, useHapticSettings, useHoldToRepeat, useHoldToRepeatByKey, useSoundSettings, useVibration } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { NotificationFeedbackType } from 'expo-haptics'
import { Stack } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'

import { useFeedbackSounds } from '@/hooks/useFeedbackSounds'
import { safeBack } from '@/utils/navigation'

const HOLD_KEYS = ['A', 'B', 'C'] as const

const FeedbackPressDemo = () => {
  const theme = useTheme()
  const { settings: hapticSettings, set: setHapticSettings } = useHapticSettings()
  const { settings: soundSettings, set: setSoundSettings } = useSoundSettings()
  const vibration = useVibration()
  const { playClick, playPop, playChime, playBuzz, playClassicClick, playClassicPop, playClassicChime, playClassicBuzz } = useFeedbackSounds()
  const soundSets = [
    {
      label: 'Default',
      sounds: [
        { label: 'Click', fn: playClick },
        { label: 'Pop', fn: playPop },
        { label: 'Chime', fn: playChime },
        { label: 'Buzz', fn: playBuzz }
      ]
    },
    {
      label: 'Classic',
      sounds: [
        { label: 'Click', fn: playClassicClick },
        { label: 'Pop', fn: playClassicPop },
        { label: 'Chime', fn: playClassicChime },
        { label: 'Buzz', fn: playClassicBuzz }
      ]
    }
  ]
  const [checked, setChecked] = useState(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [segment, setSegment] = useState('day')

  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount((c) => c + 1), [])
  const decrement = useCallback(() => setCount((c) => c - 1), [])
  const incrementHold = useHoldToRepeat(increment, 400)
  const decrementHold = useHoldToRepeat(decrement, 400)

  const [keyedCounts, setKeyedCounts] = useState<Record<string, number>>({})
  const bumpKey = useCallback((key: string) => setKeyedCounts((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 })), [])
  const keyedHold = useHoldToRepeatByKey(bumpKey, 400)

  // Measures how long each button was held before release, to make exclusive's click-on-release
  // delay visible rather than just audible/felt: Default's click fires at onPressIn (~0ms into the
  // hold, always), Exclusive's fires at onPressOut (however long the hold lasted), so the held
  // duration IS the extra delay exclusive introduces for a press that never escalates.
  const [defaultHeldMs, setDefaultHeldMs] = useState<number | null>(null)
  const [exclusiveHeldMs, setExclusiveHeldMs] = useState<number | null>(null)
  const defaultPressStart = useRef<number | null>(null)
  const exclusivePressStart = useRef<number | null>(null)
  const handleDefaultPressIn = useCallback(() => {
    defaultPressStart.current = Date.now()
  }, [])
  const handleDefaultPressOut = useCallback(() => {
    if (defaultPressStart.current == null) return
    setDefaultHeldMs(Date.now() - defaultPressStart.current)
    defaultPressStart.current = null
  }, [])
  const handleExclusivePressIn = useCallback(() => {
    exclusivePressStart.current = Date.now()
  }, [])
  const handleExclusivePressOut = useCallback(() => {
    if (exclusivePressStart.current == null) return
    setExclusiveHeldMs(Date.now() - exclusivePressStart.current)
    exclusivePressStart.current = null
  }, [])

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Feedback Press' caption='@rific/feedback-press' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Drop-in replacements for react-native-paper pressable components (Button, IconButton, TouchableRipple, Card, Chip, AppbarBackAction, AppbarAction, FAB, Checkbox, Switch, SegmentedButtons) that automatically fire expo-haptics on press, plus an app-supplied sound at the same instant. Enabled/disabled globally via FeedbackPressProvider.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            App Settings
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            App-wide switches, not just this screen&apos;s demo toggles below — haptics persists via the same redux-backed FeedbackPressProvider wiring every wrapped component already reads from, and sound persists alongside it. Both survive an app restart.
          </Text>
          <View style={styles.settingRow}>
            <Text variant='bodyMedium'>Haptics</Text>
            <Switch value={hapticSettings.vibrate} onValueChange={(v) => setHapticSettings({ vibrate: v })} />
          </View>
          <View style={styles.settingRow}>
            <Text variant='bodyMedium'>Sound</Text>
            <Switch value={soundSettings.enabled} onValueChange={(v) => setSoundSettings({ enabled: v })} />
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Haptic Types
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Tap to feel each vibration pattern.
          </Text>
          <View style={styles.row}>
            {[
              { label: 'Short', fn: () => vibration.forceShort() },
              { label: 'Medium', fn: () => vibration.forceMedium() },
              { label: 'Long', fn: () => vibration.forceLong() },
              { label: 'Double', fn: () => vibration.forceDouble() }
            ].map((h) => (
              <Button key={h.label} mode='outlined' onPress={h.fn} compact>
                {h.label}
              </Button>
            ))}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Notification Types
          </Text>
          <View style={styles.row}>
            {[
              { label: 'Success', fn: () => vibration.notification(NotificationFeedbackType.Success) },
              { label: 'Warning', fn: () => vibration.notification(NotificationFeedbackType.Warning) },
              { label: 'Error', fn: () => vibration.notification(NotificationFeedbackType.Error) }
            ].map((h) => (
              <Button key={h.label} mode='contained' onPress={h.fn} compact>
                {h.label}
              </Button>
            ))}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Sound
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            The provider plays a synthesized click on press and a synthesized pop on long-press by default. Press and hold each button below to hear both — including the original recorded set, kept around as a Classic override.
          </Text>
          <Button mode='contained' style={styles.item} onPress={() => {}} onLongPress={() => {}}>
            Provider default (press: click · hold: pop)
          </Button>
          <View style={[styles.row, styles.item]}>
            <Button mode='outlined' soundDisabled onPress={() => {}} onLongPress={() => {}}>
              soundDisabled
            </Button>
            <Button mode='outlined' hapticDisabled onPress={() => {}} onLongPress={() => {}}>
              hapticDisabled
            </Button>
            <Button mode='outlined' sound={{ selection: playChime, notification: playBuzz }} onPress={() => {}} onLongPress={() => {}}>
              Custom sound (press: chime · hold: buzz)
            </Button>
            <Button mode='outlined' sound={{ selection: playClassicClick, notification: playClassicPop }} onPress={() => {}} onLongPress={() => {}}>
              Classic sound (press: click · hold: pop)
            </Button>
          </View>

          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Notice the button above always clicks on touch-down, then also pops if you hold past delayLongPress — that&apos;s intentional default wiring, not a bug. Pass exclusive for exactly one or the other: click is deferred to release and only fires if the press never escalated to a long-press. Same onPress/onLongPress on both buttons below — Default&apos;s click always lands at ~0ms into the hold; Exclusive&apos;s lands at release, so however long you hold (short of delayLongPress) before letting go is the delay it adds. Hold each briefly and release to measure it, then hold past 400ms to feel Exclusive suppress the click entirely.
          </Text>
          <View style={[styles.row, styles.item]}>
            <View style={styles.compareItem}>
              <Button mode='outlined' onPress={() => {}} onLongPress={() => {}} onPressIn={handleDefaultPressIn} onPressOut={handleDefaultPressOut} delayLongPress={400}>
                Default
              </Button>
              <Text variant='bodySmall' style={{ color: theme.colors.onSurfaceVariant }}>
                held {defaultHeldMs ?? '—'}ms · click at ~0ms
              </Text>
            </View>
            <View style={styles.compareItem}>
              <Button mode='outlined' exclusive onPress={() => {}} onLongPress={() => {}} onPressIn={handleExclusivePressIn} onPressOut={handleExclusivePressOut} delayLongPress={400}>
                Exclusive
              </Button>
              <Text variant='bodySmall' style={{ color: theme.colors.onSurfaceVariant }}>
                held {exclusiveHeldMs ?? '—'}ms · click at ~{exclusiveHeldMs ?? '—'}ms
              </Text>
            </View>
          </View>

          <Text variant='bodySmall' style={[styles.hint, styles.item, { color: theme.colors.onSurfaceVariant }]}>
            Every sound on its own, no press gesture required — tap a chip to audition it.
          </Text>
          <Text variant='bodySmall' style={[styles.hint, styles.item, { color: theme.colors.onSurfaceVariant }]}>
            Every sound below plays through @rific/feedback-press/audio&apos;s useAudioPool rather than a single shared player, which is why rapid repeat taps on the same chip never drop a sound — each tap round-robins to a different pooled player instead of racing the previous tap&apos;s still-in-flight playback.
          </Text>
          {soundSets.map((set) => (
            <View key={set.label} style={styles.item}>
              <Text variant='labelLarge' style={styles.soundSetLabel}>
                {set.label}
              </Text>
              <View style={styles.row}>
                {set.sounds.map((s) => (
                  <Chip key={s.label} soundDisabled onPress={s.fn} compact>
                    {s.label}
                  </Chip>
                ))}
              </View>
            </View>
          ))}

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Wrapped Components
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Each is a drop-in replacement for its react-native-paper counterpart: same API, haptics and sound added automatically.
          </Text>

          <Button mode='contained' style={styles.item} onPress={() => {}}>
            Button (contained)
          </Button>
          <Button mode='outlined' style={styles.item} onPress={() => {}}>
            Button (outlined)
          </Button>

          <View style={[styles.row, styles.item]}>
            <Chip onPress={() => {}}>Chip</Chip>
            <Chip onPress={() => {}} selected>
              Chip selected
            </Chip>
            <Chip onPress={() => {}} icon='star'>
              With icon
            </Chip>
          </View>

          <Card style={styles.item} onPress={() => {}}>
            <Card.Title title='Feedback Card' subtitle='Press anywhere on this card for haptic + sound feedback' />
          </Card>

          <View style={styles.fabRow}>
            <FAB icon='plus' size='small' onPress={() => {}} />
            <FAB icon='check' size='small' mode='flat' onPress={() => {}} />
            <FAB icon='heart' size='small' mode='elevated' onPress={() => {}} />
          </View>

          <View style={[styles.row, styles.item]}>
            <IconButton icon='star-outline' onPress={() => {}} />
            <AppbarAction icon='dots-vertical' onPress={() => {}} />
          </View>

          <View style={[styles.row, styles.item]}>
            <Checkbox status={checked ? 'checked' : 'unchecked'} onPress={() => setChecked((c) => !c)} />
            <Switch value={switchOn} onValueChange={setSwitchOn} />
          </View>

          <SegmentedButtons
            style={styles.item}
            value={segment}
            onValueChange={(value) => setSegment(Array.isArray(value) ? value[0] : value)}
            buttons={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' }
            ]}
          />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Hold to Repeat
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            useHoldToRepeat fires an action immediately once you&apos;ve held past delayLongPress, then again every 400ms for as long as you keep holding — with a haptic + sound pulse on every tick, not just the first. Release to stop instantly. Press and hold, don&apos;t tap.
          </Text>
          <View style={styles.holdRow}>
            <FAB icon='minus' size='small' onLongPress={decrementHold.onLongPress} onPressOut={decrementHold.onPressOut} delayLongPress={400} />
            <Text variant='headlineSmall' style={styles.holdCount}>
              {count}
            </Text>
            <FAB icon='plus' size='small' onLongPress={incrementHold.onLongPress} onPressOut={incrementHold.onPressOut} delayLongPress={400} />
          </View>

          <Text variant='titleMedium' style={[styles.sectionLabel, styles.item]}>
            Hold to Repeat (keyed)
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            useHoldToRepeatByKey keeps a separate timer per key — hold two of these at once (two fingers) and each repeats on its own cadence; releasing one never stops the other.
          </Text>
          <View style={styles.row}>
            {HOLD_KEYS.map((key) => (
              <View key={key} style={styles.keyedItem}>
                <Text variant='labelLarge'>
                  {key}: {keyedCounts[key] ?? 0}
                </Text>
                <FAB icon='plus' size='small' onLongPress={keyedHold.onLongPress(key)} onPressOut={keyedHold.onPressOut(key)} delayLongPress={400} />
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  compareItem: { alignItems: 'center', gap: 4 },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  fabRow: { flexDirection: 'row', gap: 16, justifyContent: 'center', paddingVertical: 8 },
  fill: { flex: 1 },
  hint: { marginBottom: 12 },
  holdCount: { minWidth: 40, textAlign: 'center' },
  holdRow: { alignItems: 'center', flexDirection: 'row', gap: 16, justifyContent: 'center', paddingVertical: 8 },
  item: { marginBottom: 12 },
  keyedItem: { alignItems: 'center', gap: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionLabel: { marginBottom: 8 },
  settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  soundSetLabel: { marginBottom: 4 }
})

export default FeedbackPressDemo
