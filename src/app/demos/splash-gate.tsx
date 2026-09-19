import { Button, Chip } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { createGate } from '@rific/splash-gate'
import { Stack } from 'expo-router'
import { type ReactNode, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ActivityIndicator, Divider, Icon, Surface, Text, useTheme } from 'react-native-paper'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { safeBack } from '@/utils/navigation'

// A handful of made-up conditions for this demo's own sandboxed "screen" below, not the real
// app's own gates (see src/utils/splashGate.ts's 'theme'/'fonts', already resolved long before you
// could ever navigate to this screen). The real native splash screen can only ever be shown once,
// at the very start of a cold launch, so there's no way to bring it back on-screen from here to
// demo it directly. This recreates the exact same mechanism, isolated, so it can be replayed.
const DEMO_GATES = ['theme', 'fonts', 'preferences'] as const
type DemoGate = (typeof DEMO_GATES)[number]

const GATE_LABELS: Record<DemoGate, string> = {
  theme: 'Theme',
  fonts: 'Icon font',
  preferences: 'Saved preferences'
}

const INFO_ITEMS = [
  {
    label: 'createGate(gates)',
    desc: 'Call once, at module scope, with every async condition your first screen depends on. Returns markReady, useReady, Gate, and pendingGates, all bound to that one instance.'
  },
  {
    label: 'markReady(gate) / useReady(gate, ready)',
    desc: "Mark a gate ready from wherever it actually resolves: markReady for a one-shot callback (a library's own onReady prop), useReady for a plain boolean (state from a hook)."
  },
  {
    label: 'Gate',
    desc: "A component form of useReady that also withholds its children until ready. For a child whose own state locks in on first render (see the comparison above), a gate reporting ready isn't enough on its own — the child must not mount at all until the real value exists."
  },
  {
    label: 'One hide, once',
    desc: 'The splash screen hides exactly once, the moment every named gate has reported ready, in whatever order they actually resolve. An empty gate list hides immediately rather than hanging.'
  }
]

const PLACEHOLDER_COLOR = '#9E9E9E'
const RESOLVED_COLOR = '#7C4DFF'

// Stand-in for the kind of third-party provider Gate exists to guard: its internal state locks
// onto whatever `initialColor` was on the very first render and never reads the prop again, same
// as a real context provider's `useState(() => initialProp)`. Mount it early with a placeholder
// and patch the real color into its prop later, as the "Without Gate" card below does, and it
// can't work — the state already locked onto the placeholder, permanently, even though the prop
// technically changed underneath it.
const LockingColorProvider = ({ initialColor, children }: { initialColor: string; children: (color: string) => ReactNode }) => {
  const [color] = useState(() => initialColor)
  return children(color)
}

const SplashGateDemo = () => {
  const theme = useTheme()
  const [gate, setGate] = useState(() => createGate(DEMO_GATES))
  const [readyGates, setReadyGates] = useState<Set<DemoGate>>(new Set())
  const allReady = readyGates.size === DEMO_GATES.length

  const markReady = (name: DemoGate) => {
    if (readyGates.has(name)) return
    gate.markReady(name)
    setReadyGates((prev) => new Set(prev).add(name))
  }

  const reset = () => {
    setGate(createGate(DEMO_GATES))
    setReadyGates(new Set())
  }

  const [colorGate, setColorGate] = useState(() => createGate(['color'] as const))
  const [colorReady, setColorReady] = useState(false)
  const [colorRunId, setColorRunId] = useState(0)
  const { Gate: ColorGate } = colorGate

  const resolveColor = () => {
    colorGate.markReady('color')
    setColorReady(true)
  }

  const resetColorDemo = () => {
    setColorGate(createGate(['color'] as const))
    setColorReady(false)
    setColorRunId((n) => n + 1)
  }

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Splash Gate' caption='@rific/splash-gate' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Names every async condition your app&apos;s first screen depends on and holds the splash screen up until all of them report ready, instead of hiding it the moment the first one resolves and letting anything else (an icon font, a hydrated preference) pop in a beat later. Wired into this starter&apos;s own launch in <Text style={styles.code}>Theme.tsx</Text>, see below.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Live Simulation
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Mark each condition ready and watch the sandbox below reveal itself the instant all three are in, not one at a time.
          </Text>

          <Surface style={[styles.sandbox, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
            <View style={styles.sandboxContent}>
              <Icon source='check-decagram' size={28} color={theme.colors.primary} />
              <Text variant='titleMedium' style={styles.sandboxTitle}>
                Home Screen
              </Text>
              <Text variant='bodySmall' style={{ color: theme.colors.onSurfaceVariant }}>
                Everything below was already correct the moment you could see it.
              </Text>
            </View>
            {!allReady && (
              <Animated.View exiting={FadeOut.duration(400)} style={[styles.sandboxOverlay, { backgroundColor: theme.colors.surface }]}>
                <ActivityIndicator size='small' />
                <Text variant='labelMedium' style={styles.sandboxOverlayLabel}>
                  Splash screen (simulated)
                </Text>
              </Animated.View>
            )}
          </Surface>

          <View style={styles.row}>
            {DEMO_GATES.map((name) => {
              const ready = readyGates.has(name)
              return (
                <Chip key={name} icon={ready ? 'check' : 'timer-sand'} selected={ready} disabled={ready} onPress={() => markReady(name)}>
                  {GATE_LABELS[name]}
                </Chip>
              )
            })}
          </View>
          {allReady ? (
            <Animated.View entering={FadeIn}>
              <Button mode='outlined' onPress={reset} style={styles.resetButton}>
                Reset
              </Button>
            </Animated.View>
          ) : null}

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            The Gate Component
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            <Text style={styles.code}>useReady</Text> only tells the splash screen to keep waiting &mdash; it says nothing about when the component using the value first renders. Imagine <Text style={styles.code}>initialColor</Text> below is a saved accent color loading from storage, handed to a provider whose state locks in on first render, the same <Text style={styles.code}>useState(() =&gt; initialColor)</Text> pattern most context providers use. Render it before the color arrives and patch the prop in later, and it&apos;s stuck on the placeholder forever &mdash; nothing here ever throws or logs an error.
          </Text>

          <View style={styles.gateRow}>
            <Surface style={[styles.gateCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
              <Text variant='labelMedium'>Without Gate</Text>
              <LockingColorProvider key={`without-${colorRunId}`} initialColor={colorReady ? RESOLVED_COLOR : PLACEHOLDER_COLOR}>
                {(color) => <View style={[styles.swatch, { backgroundColor: color }]} />}
              </LockingColorProvider>
              <Text variant='bodySmall' style={[styles.gateCardStatus, { color: theme.colors.onSurfaceVariant }]}>
                {colorReady ? 'Locked onto the placeholder on mount, stuck that way' : 'Mounted immediately with a placeholder'}
              </Text>
            </Surface>
            <Surface style={[styles.gateCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
              <Text variant='labelMedium'>With Gate</Text>
              <ColorGate key={`with-${colorRunId}`} gate='color' ready={colorReady} fallback={<ActivityIndicator size='small' style={styles.swatch} />}>
                <LockingColorProvider initialColor={RESOLVED_COLOR}>{(color) => <View style={[styles.swatch, { backgroundColor: color }]} />}</LockingColorProvider>
              </ColorGate>
              <Text variant='bodySmall' style={[styles.gateCardStatus, { color: theme.colors.onSurfaceVariant }]}>
                {colorReady ? 'Only mounted once ready, correct from frame one' : 'Withheld until ready'}
              </Text>
            </Surface>
          </View>

          <View style={styles.row}>
            <Button mode='outlined' disabled={colorReady} onPress={resolveColor}>
              Simulate color loading
            </Button>
            {colorReady ? (
              <Animated.View entering={FadeIn}>
                <Button mode='text' onPress={resetColorDemo}>
                  Reset
                </Button>
              </Animated.View>
            ) : null}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            How It Works
          </Text>
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            {INFO_ITEMS.map((item, i) => (
              <View key={item.label} style={[styles.infoItem, i === 0 && styles.infoItemFirst]}>
                <Text variant='labelMedium' style={styles.code}>
                  {item.label}
                </Text>
                <Text variant='bodySmall' style={[styles.infoItemDesc, { color: theme.colors.onSurfaceVariant }]}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </Surface>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            In This App
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            <Text style={styles.code}>src/utils/splashGate.ts</Text> declares this app&apos;s real gates, currently <Text style={styles.code}>theme</Text> and <Text style={styles.code}>fonts</Text>. <Text style={styles.code}>Theme.tsx</Text> marks <Text style={styles.code}>theme</Text> ready once auto-paper&apos;s Provider reports in, and <Text style={styles.code}>fonts</Text> ready once the icon font every react-native-paper icon in this app depends on finishes loading. Add a new gate any time a future screen picks up another async dependency of its own. That same file also exports <Text style={styles.code}>SplashGate</Text>, the <Text style={styles.code}>Gate</Text> component demoed above, unused so far: <Text style={styles.code}>PersistGate</Text> already blocks every provider below it until Redux&apos;s persisted state has rehydrated, so nothing in this app currently mounts before its data does. It&apos;s there for the first future provider that does.
          </Text>
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  code: { fontFamily: 'monospace' },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  fill: { flex: 1 },
  gateCard: { alignItems: 'center', borderRadius: 12, flex: 1, gap: 8, padding: 16 },
  gateCardStatus: { textAlign: 'center' },
  gateRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  hint: { marginBottom: 12 },
  infoCard: { borderRadius: 12 },
  infoItem: {
    borderTopColor: 'rgba(128,128,128,0.2)',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16
  },
  infoItemDesc: { marginTop: 4 },
  infoItemFirst: { borderTopWidth: 0 },
  resetButton: { alignSelf: 'flex-start', marginTop: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sandbox: { borderRadius: 12, height: 160, marginBottom: 4, overflow: 'hidden' },
  sandboxContent: { alignItems: 'center', flex: 1, gap: 4, justifyContent: 'center', padding: 16 },
  sandboxOverlay: { alignItems: 'center', bottom: 0, gap: 8, justifyContent: 'center', left: 0, position: 'absolute', right: 0, top: 0 },
  sandboxOverlayLabel: { opacity: 0.7 },
  sandboxTitle: { marginTop: 4 },
  sectionLabel: { marginBottom: 8 },
  swatch: { borderRadius: 8, height: 48, width: 48 }
})

export default SplashGateDemo
