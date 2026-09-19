import { IconButton } from '@rific/feedback-press'
import { ResizableInput, ResizableInputProvider } from '@rific/resizable-input'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Stack } from 'expo-router'
import { useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, TextInput as PaperTextInput, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const HEIGHT_STEP = 20
const MIN_HEIGHT_FLOOR = 40
const MAX_HEIGHT_CEILING = 500

const FEATURES = ['Auto-grows vertically with content as the user types', 'Drag handle lets users manually resize the input', 'Configurable min/max height constraints', 'initialHeight for a fixed starting size', 'TextInputComponent swaps in any input component: react-native-paper, a custom one, or none at all (defaults to core RN TextInput)', 'configureResizableInput()/ResizableInputProvider set a global default component once, instead of repeating TextInputComponent at every call site', 'Forwarded ref for imperative focus control', 'onHeightChange callback for layout-aware UIs', 'renderHandle prop for a fully custom resize handle', 'handleColor for quick handle tint without a custom renderer']

const PROPS = [
  { name: 'autoGrow', type: 'boolean', desc: 'Grow with content as the user types. Default: true.' },
  { name: 'resizable', type: 'boolean', desc: 'Show a drag handle for manual resizing. Default: true.' },
  { name: 'minHeight', type: 'number', desc: 'Minimum height in pixels. Defaults to the natural single-line height.' },
  { name: 'maxHeight', type: 'number', desc: 'Maximum height. Input stops growing and scrolls beyond this.' },
  { name: 'initialHeight', type: 'number', desc: 'Explicit starting height, overriding natural baseline.' },
  { name: 'handleColor', type: 'string', desc: 'Tint color for the built-in drag handle.' },
  { name: 'renderHandle', type: '() => ReactNode', desc: 'Fully replace the default drag handle.' },
  { name: 'onHeightChange', type: '(h: number) => void', desc: 'Fires whenever the component height changes.' },
  { name: 'TextInputComponent', type: 'ComponentType', desc: "Overrides the configured global default (see below) for this one instance. Falls back to React Native's own TextInput if neither is set." }
]

const USAGE = `import { ResizableInput, ResizableInputProvider } from '@rific/resizable-input'
import { TextInput as PaperTextInput } from 'react-native-paper'

// Configure once, near your app root: every ResizableInput after
// this defaults to Paper's TextInput, nothing to repeat per instance
<ResizableInputProvider TextInputComponent={PaperTextInput}>
  {/* your app */}
</ResizableInputProvider>

// Auto-grows, Paper-styled by the configured default above
<ResizableInput
  mode="outlined"
  label="Notes"
  placeholder="Start typing…"
  minHeight={80}
  maxHeight={300}
/>

// Override the default for one instance
<ResizableInput
  TextInputComponent={SomeOtherInput}
  value={text}
  onChangeText={setText}
/>`

const ResizableInputDemoContent = () => {
  const theme = useTheme()
  const [notes, setNotes] = useState<string | null>('')
  const [minHeight, setMinHeight] = useState(80)
  const [maxHeight, setMaxHeight] = useState(240)

  const decreaseMinHeight = () => setMinHeight((h) => Math.max(MIN_HEIGHT_FLOOR, h - HEIGHT_STEP))
  const increaseMinHeight = () => setMinHeight((h) => Math.min(h + HEIGHT_STEP, maxHeight - HEIGHT_STEP))
  const decreaseMaxHeight = () => setMaxHeight((h) => Math.max(h - HEIGHT_STEP, minHeight + HEIGHT_STEP))
  const increaseMaxHeight = () => setMaxHeight((h) => Math.min(MAX_HEIGHT_CEILING, h + HEIGHT_STEP))

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Resizable Input' caption='@rific/resizable-input' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Auto-growing, drag-resizable text input for React Native. Expands with content automatically and gives users a drag handle to resize manually. Works with any input component; this page configures it to default to react-native-paper&apos;s TextInput.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Try it
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Type to auto-grow, or drag the handle in the bottom-right corner to resize manually. Renders as react-native-paper&apos;s TextInput without passing TextInputComponent here: that&apos;s the ResizableInputProvider default configured above, doing its job. minHeight/maxHeight below are adjustable, so you can see the drag handle actually stop at the limit.
          </Text>

          <View style={styles.heightControls}>
            <View style={styles.heightControl}>
              <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
                minHeight: {minHeight}px
              </Text>
              <View style={styles.stepperRow}>
                <IconButton icon='minus' mode='outlined' onPress={decreaseMinHeight} size={16} />
                <IconButton icon='plus' mode='outlined' onPress={increaseMinHeight} size={16} />
              </View>
            </View>
            <View style={styles.heightControl}>
              <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
                maxHeight: {maxHeight}px
              </Text>
              <View style={styles.stepperRow}>
                <IconButton icon='minus' mode='outlined' onPress={decreaseMaxHeight} size={16} />
                <IconButton icon='plus' mode='outlined' onPress={increaseMaxHeight} size={16} />
              </View>
            </View>
          </View>

          <ResizableInput minHeight={minHeight} maxHeight={maxHeight} multiline onChangeText={setNotes} placeholder='Start typing…' value={notes} />

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

// TextInputComponent configured here (rather than globally in Providers.tsx) since
// ResizableInput is only used on this one screen: configureResizableInput()/
// <ResizableInputProvider> is one-time setup, but that just means "before your first
// ResizableInput renders," not necessarily the app root.
const ResizableInputDemoPage = () => (
  <ResizableInputProvider TextInputComponent={PaperTextInput}>
    <ResizableInputDemoContent />
  </ResizableInputProvider>
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
  fill: { flex: 1 },
  heightControl: { alignItems: 'center' },
  heightControls: { flexDirection: 'row', gap: 24, justifyContent: 'center', marginBottom: 12 },
  hint: { marginBottom: 12 },
  propDesc: { marginTop: 2 },
  propRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  propType: { marginLeft: 8 },
  sectionLabel: { marginBottom: 12 },
  stepperRow: { alignItems: 'center', flexDirection: 'row' }
})

export default ResizableInputDemoPage
