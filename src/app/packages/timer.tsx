import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Stack } from 'expo-router'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const FEATURES = ['Smooth SVG ring animation driven by React Native Animated', 'Start / stop controlled by a timestamp string, no manual animation state', 'Resume mid-timer with startProgress (0–1)', 'Configurable color, radius, and stroke width', 'Children rendered at the center of the ring, display a countdown, icon, or label', 'onStart / onStop callbacks for side-effects', 'Uses native driver for 60 fps animation without JS thread', 'Zero dependencies beyond react-native-svg']

const PROPS = [
  { name: 'started', type: 'string | null', desc: 'Required. ISO timestamp string. Set to start; set to null to stop and reset.' },
  { name: 'duration', type: 'number', desc: 'Required. Total timer duration in seconds.' },
  { name: 'color', type: 'string', desc: 'Required. Stroke color of the progress ring.' },
  { name: 'radius', type: 'number', desc: 'Required. Radius of the ring in pixels.' },
  { name: 'width', type: 'number', desc: 'Stroke width. Default: 6.' },
  { name: 'startProgress', type: 'number', desc: 'Initial progress (0–1) for resuming a mid-timer. Default: 0.' },
  { name: 'onStart', type: '() => void', desc: 'Called when the animation begins.' },
  { name: 'onStop', type: '() => void', desc: 'Called when the animation finishes naturally.' },
  { name: 'children', type: 'ReactNode', desc: 'Rendered at the center of the ring (e.g., countdown text).' },
  { name: 'style', type: 'ViewStyle', desc: 'Style applied to the outer container.' }
]

const USAGE = `import { Timer } from '@rific/timer'
import { useState } from 'react'
import { Text } from 'react-native'

const CountdownTimer = () => {
  const [started, setStarted] = useState<string | null>(null)

  return (
    <>
      <Timer
        started={started}
        duration={30}
        color="#4caf50"
        radius={60}
        width={8}
        onStop={() => setStarted(null)}
      >
        <Text style={{ fontSize: 24 }}>30s</Text>
      </Timer>

      <Button onPress={() => setStarted(new Date().toISOString())}>
        Start
      </Button>
      <Button onPress={() => setStarted(null)}>
        Stop
      </Button>
    </>
  )
}`

const TimerPage = () => {
  const theme = useTheme()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='@rific/timer' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='headlineSmall'>Timer</Text>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Animated SVG progress ring timer for React Native. Controlled by a timestamp string: set it to start the countdown, null to stop. Supports resume, center content, and native-driver animation for smooth 60 fps rendering.
          </Text>

          <Surface style={[styles.installBox, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text style={[styles.code, { color: theme.colors.onSurfaceVariant }]}>npm install @rific/timer react-native-svg</Text>
          </Surface>

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
  installBox: { borderRadius: 8, marginTop: 16, padding: 12 },
  propDesc: { marginTop: 2 },
  propRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap' },
  propType: { marginLeft: 8 },
  sectionLabel: { marginBottom: 12 }
})

export default TimerPage
