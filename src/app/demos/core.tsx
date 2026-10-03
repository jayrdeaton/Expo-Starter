import { createModuleConfig, createSettingHook, createSettingsContext, createSettingsSlice, getNavigationConfig, type OptionalModule } from '@rific/core'
import { Button, Chip, Switch } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useReducer, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

// --- createSettingsContext + createSettingHook ------------------------------------------------
// Every instance here is its own isolated demo triple, created at module scope exactly the way
// @rific/feedback-press, @rific/scroll-view and @rific/auto-paper each create theirs internally.
// Nothing here touches this app's real Redux store.
type DemoSettings = { accent: 'violet' | 'teal' | 'amber'; compact: boolean }
const ACCENTS: DemoSettings['accent'][] = ['violet', 'teal', 'amber']
const ACCENT_COLORS: Record<DemoSettings['accent'], string> = { violet: '#7C4DFF', teal: '#009688', amber: '#FFA000' }

const { Provider: DemoSettingsProvider, useSettings: useDemoSettings } = createSettingsContext<DemoSettings>({ accent: 'violet', compact: false })
const useCompact = createSettingHook(useDemoSettings, 'compact')

// --- createSettingsSlice ------------------------------------------------------------------------
type DemoSliceState = { label: string; step: number }
const {
  actions: demoActions,
  reducer: demoReducer,
  selectors: demoSelectors
} = createSettingsSlice('demo', {
  initialState: { label: 'Hello', step: 1 } as DemoSliceState,
  selectors: ['label']
})
const DEMO_SLICE_INITIAL = demoReducer(undefined, { type: '@@init' })
// A blob persisted by an older build, before `label` existed. Run against fresh (undefined) state,
// what a cold launch actually starts from, instead of the demo's live state, so the backfill is
// visible.
const STALE_REHYDRATE = { payload: { demo: { step: 5 } }, type: 'persist/REHYDRATE' }
const DEMO_SLICE_REHYDRATED = demoReducer(undefined, STALE_REHYDRATE)

// --- createModuleConfig + OptionalModule --------------------------------------------------------
// Mirrors only the slice of the injected module this demo actually calls, never
// `typeof import('the-real-package')` — the same rule @rific/scanner follows for
// expo-camera/react-native-paper and @rific/drawer for @rific/auto-paper.
type GreeterModule = { greet: (name: string) => string }
type DemoModuleConfig = { greeter?: OptionalModule<GreeterModule> }
const demoModule = createModuleConfig<DemoModuleConfig>()
const enthusiasticGreeter: GreeterModule = { greet: (name) => `Hello, ${name}!` }

const INFO_ITEMS = [
  {
    label: 'createSettingsContext(defaults)',
    desc: 'Returns { Context, Provider, useSettings }: a live, patchable settings object. Provider takes initialValue and onChange. initialValue seeds the settings at mount (rehydrate from your own storage) and stays live afterwards: when a key’s value changes, the Provider adopts it, ignoring unchanged keys and echoes of its last onChange. onChange fires with the full next object after every set and every adopted change, never for the initial seed. Persistence is entirely the app’s job. With no Provider mounted, settings read as defaults and set silently drops.'
  },
  {
    label: 'createSettingHook(useSettings, key)',
    desc: 'Wraps a generated useSettings to expose one field as { value, setValue }, for a caller that only cares about a single field rather than the whole patch-based contract.'
  },
  {
    label: 'createSettingsSlice(namespace, options)',
    desc: 'The same shape for Redux, with no @reduxjs/toolkit dependency: { actions, reducer, createReducer, selectors }. Action types are namespaced (demo/setStep), every field gets a setX action by default, and the reducer backfills missing fields when redux-persist rehydrates an older blob.'
  },
  {
    label: 'createModuleConfig(defaults)',
    desc: 'Returns { configure, getConfig, Provider }: plain module-level state for injecting an optional peer module (react-native-paper, expo-camera, …) without a hard dependency on it. One-time startup setup, not reactive.'
  },
  {
    label: 'OptionalModule<T>',
    desc: 'Just T | undefined. Names the convention the injection above follows: accept the module as an explicit prop instead of auto-detecting it (Metro breaks that silently in ESM builds), mirror only the shape you use as a local type, and degrade gracefully when it’s omitted.'
  },
  {
    label: 'safeBack / configureNavigation',
    desc: 'A zero-argument expo-router back-navigation guard built on createModuleConfig. Goes back when there is history, otherwise replaces to fallbackPath (default "/") instead of throwing "GO_BACK was not handled by any navigator".'
  }
]

const IN_THIS_APP = [
  { label: 'Redux slices', desc: 'Every slice mounted in src/redux/store.ts is a createSettingsSlice instance: the theme, haptic, sound and scrollView slices from the packages (themeReducer, hapticReducer, soundReducer, scrollViewReducer), plus this app’s own settings slice in src/redux/settingsSlice.ts.' },
  { label: 'Settings contexts', desc: 'useThemeSettings, useHapticSettings, useSoundSettings and useScrollViewSettings are createSettingsContext instances, fed by the Redux-backed bridges in Theme.tsx and Providers.tsx.' },
  { label: 'Module config', desc: '@rific/drawer (DrawerProvider autoPaper={…}, mounted once in Providers.tsx) and @rific/resizable-input (ResizableInputProvider, on its demo screen) inject their optional peers through createModuleConfig.' },
  { label: 'safeBack', desc: 'src/utils/navigation.ts calls configureNavigation({ router }) once at module load and re-exports safeBack; every screen’s header back button in this app goes through it.' }
]

const Readout = ({ children }: { children: string }) => {
  const theme = useTheme()
  return (
    <Surface style={[styles.readout, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
      <Text variant='bodySmall' style={styles.code}>
        {children}
      </Text>
    </Surface>
  )
}

const SettingsContextPanel = () => {
  const { settings, set } = useDemoSettings()
  const { value: compact, setValue: setCompact } = useCompact()

  return (
    <View>
      <View style={styles.settingRow}>
        <Text variant='bodyMedium'>compact (via createSettingHook)</Text>
        <Switch value={compact} onValueChange={setCompact} accessibilityLabel='compact (via createSettingHook)' />
      </View>
      <View style={styles.row}>
        {ACCENTS.map((accent) => (
          <Chip key={accent} selected={settings.accent === accent} onPress={() => set({ accent })}>
            {accent}
          </Chip>
        ))}
      </View>
      <View style={styles.row}>
        <Button mode='outlined' compact onPress={() => set({ accent: 'amber', compact: true })}>
          Patch both at once
        </Button>
        <Button mode='text' compact onPress={() => set({ accent: 'violet', compact: false })}>
          Reset
        </Button>
      </View>
      <View style={[styles.swatch, compact ? styles.swatchCompact : styles.swatchFull, { backgroundColor: ACCENT_COLORS[settings.accent] }]} />
      <Readout>{`settings = ${JSON.stringify(settings)}`}</Readout>
    </View>
  )
}

const SettingsContextDemo = () => {
  const theme = useTheme()
  const [log, setLog] = useState<string[]>([])
  const pushLog = (line: string) => setLog((prev) => [line, ...prev].slice(0, 4))

  return (
    <DemoSettingsProvider initialValue={{ accent: 'teal' }} onChange={(next) => pushLog(JSON.stringify(next))}>
      <SettingsContextPanel />
      <Text variant='labelMedium' style={styles.logLabel}>
        onChange log
      </Text>
      <Readout>{log.length ? log.map((line) => `onChange(${line})`).join('\n') : 'nothing yet: initialValue seeds "teal" without firing onChange'}</Readout>
      <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Each entry is the full next settings object, which is the hook an app uses to persist it (this app dispatches it to Redux).
      </Text>
    </DemoSettingsProvider>
  )
}

const SettingsSliceDemo = () => {
  const theme = useTheme()
  const [state, dispatch] = useReducer(demoReducer, DEMO_SLICE_INITIAL)
  const [lastType, setLastType] = useState<string | null>(null)
  const send = (action: { type: string }) => {
    setLastType(action.type)
    dispatch(action)
  }

  return (
    <View>
      <View style={styles.row}>
        <Button mode='outlined' compact onPress={() => send(demoActions.setStep(state.step + 1))}>
          setStep(+1)
        </Button>
        <Button mode='outlined' compact onPress={() => send(demoActions.setLabel(state.label === 'Hello' ? 'World' : 'Hello'))}>
          setLabel(toggle)
        </Button>
        <Button mode='text' compact onPress={() => send(demoActions.initialize(DEMO_SLICE_INITIAL))}>
          initialize(defaults)
        </Button>
      </View>
      <Readout>{`state = ${JSON.stringify(state)}\nselectLabel(state) = ${JSON.stringify(demoSelectors.selectLabel(state))}\nlast action.type = ${lastType ?? '—'}`}</Readout>

      <Text variant='labelMedium' style={styles.logLabel}>
        Rehydrating an older persisted blob
      </Text>
      <Readout>{`persisted = ${JSON.stringify(STALE_REHYDRATE.payload.demo)}\nrehydrated = ${JSON.stringify(DEMO_SLICE_REHYDRATED)}`}</Readout>
      <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        redux-persist replaces a slice wholesale on rehydrate, so a field added after the blob was saved would come back undefined. The generated reducer backfills it from its defaults instead (it reads payload[namespace], so mount the slice under a store key equal to its namespace).
      </Text>
    </View>
  )
}

const GreetingLine = () => {
  const theme = useTheme()
  const { greeter } = demoModule.getConfig()
  return (
    <Text variant='bodyMedium' style={{ color: greeter ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
      {greeter ? greeter.greet('World') : 'No greeter injected, so this degrades to a plain fallback line instead of throwing.'}
    </Text>
  )
}

const ModuleConfigDemo = () => {
  const theme = useTheme()
  // configure() is plain module state, not React state: nothing re-renders on its own. This
  // counter exists only so the button below can re-render <GreetingLine /> after calling it.
  const [, rerender] = useState(0)
  const apply = (next: DemoModuleConfig) => {
    demoModule.configure(next)
    rerender((n) => n + 1)
  }

  return (
    <View>
      <Surface style={[styles.greetingCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={1}>
        <GreetingLine />
      </Surface>
      <View style={styles.row}>
        <Button mode='outlined' compact onPress={() => apply({ greeter: enthusiasticGreeter })}>
          configure({'{ greeter }'})
        </Button>
        <Button mode='text' compact onPress={() => apply({ greeter: undefined })}>
          Clear
        </Button>
      </View>
      <Readout>{`getConfig() = { greeter: ${demoModule.getConfig().greeter ? '[module]' : 'undefined'} }`}</Readout>
      <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        The generated Provider does the same call for you: {'<Provider greeter={…}>'} runs configure synchronously during render, so descendants already see it on the very first pass.
      </Text>
    </View>
  )
}

const SafeBackDemo = () => {
  const theme = useTheme()
  const { fallbackPath, router } = getNavigationConfig()

  return (
    <View>
      <Readout>{`getNavigationConfig() = { router: ${router ? 'configured' : 'undefined'}, fallbackPath: ${JSON.stringify(fallbackPath)} }`}</Readout>
      <View style={styles.row}>
        <Button mode='outlined' compact onPress={safeBack}>
          safeBack()
        </Button>
      </View>
      <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        Try it: open this screen straight from a deep link or a browser refresh (no back-stack) and press the header back arrow, which is safeBack. Instead of expo-router&apos;s &quot;GO_BACK was not handled by any navigator&quot; error, it lands on {JSON.stringify(fallbackPath)}. Pressing the button above does the same thing.
      </Text>
    </View>
  )
}

const CoreDemo = () => {
  const theme = useTheme()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Core' caption='@rific/core' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            The shared foundation that auto-paper, drawer, feedback-press, resizable-input and scroll-view require as a peer: one home for the settings-context, Redux-slice and optional-module-injection shapes they each used to hand-roll separately, plus <Text style={styles.code}>safeBack</Text>. It has no UI of its own, so the first three sections below each run an isolated instance of a factory, not this app&apos;s real store; the safeBack section uses the app&apos;s real navigation config.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            createSettingsContext
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            A live, patchable settings object. Toggle and patch it, then watch the log below: onChange receives the full settings object on every change, and never for the initial seed.
          </Text>
          <SettingsContextDemo />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            createSettingsSlice
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            The Redux half of the same shape. This one is driven with a plain useReducer, since the generated reducer needs no store, no RTK and no persistence to run.
          </Text>
          <SettingsSliceDemo />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            createModuleConfig
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            One-time injection of an optional module, typed as <Text style={styles.code}>OptionalModule&lt;T&gt;</Text>. Inject a greeter and the line below uses it; clear it and the line degrades gracefully.
          </Text>
          <ModuleConfigDemo />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            safeBack
          </Text>
          <SafeBackDemo />

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
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            {IN_THIS_APP.map((item, i) => (
              <View key={item.label} style={[styles.infoItem, i === 0 && styles.infoItemFirst]}>
                <Text variant='labelMedium'>{item.label}</Text>
                <Text variant='bodySmall' style={[styles.infoItemDesc, { color: theme.colors.onSurfaceVariant }]}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </Surface>
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  code: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  fill: { flex: 1 },
  greetingCard: { borderRadius: 12, padding: 16 },
  hint: { marginBottom: 12, marginTop: 8 },
  infoCard: { borderRadius: 12 },
  infoItem: {
    borderTopColor: 'rgba(128,128,128,0.2)',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16
  },
  infoItemDesc: { marginTop: 4 },
  infoItemFirst: { borderTopWidth: 0 },
  logLabel: { marginTop: 16 },
  readout: { borderRadius: 8, marginTop: 8, padding: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  sectionLabel: { marginBottom: 8 },
  settingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  swatch: { borderRadius: 8, marginTop: 12 },
  swatchCompact: { height: 24 },
  swatchFull: { height: 56 }
})

export default CoreDemo
