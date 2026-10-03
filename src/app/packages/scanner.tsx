import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const FEATURES = ['Full-screen camera view with animated scan overlay', 'Bounds component draws a highlighted rectangle around detected barcodes', 'TimerRing shows a countdown ring when a scan timeout is configured', 'Pinch-to-zoom', 'Scan deduplication, so onScan fires once per unique code per session', 'useScanOverlays hook for building custom animated feedback', 'Photo capture with configurable quality and base64 output', 'Multi-barcode support, detects all codes in frame simultaneously', 'configureScanner()/ScannerProvider set expo-camera, react-native-paper, and react-native-safe-area-context once, app-wide, no per-instance repetition', 'TypeScript types for scan results and photo results']

const PROPS = [
  { name: 'onScan', type: '(result: ScanResult) => void', desc: 'Fired when a barcode is successfully scanned.' },
  { name: 'onPhoto', type: '(result: PhotoResult) => void', desc: 'Fired after a photo capture completes (requires mode="photo").' },
  { name: 'timeout', type: 'number', desc: 'Seconds before the TimerRing expires and onTimeout fires.' },
  { name: 'camera / paper / safeArea', type: 'module', desc: 'Per-instance overrides for the configureScanner() defaults below; omit these unless one particular screen needs something different.' },
  {
    name: 'ScanResult',
    type: 'type',
    desc: '{ data: string, type: string }: the decoded barcode value and symbology.'
  },
  { name: 'PhotoResult', type: 'type', desc: '{ uri, width, height, base64? } from a capture.' }
]

const USAGE = `import { configureScanner, Scanner } from '@rific/scanner'
import * as ExpoCamera from 'expo-camera'
import * as RNPaper from 'react-native-paper'
import * as SafeAreaContext from 'react-native-safe-area-context'

// Once, near your app root: expo-camera is required for the camera
// feed itself; react-native-paper and react-native-safe-area-context
// are optional (richer icon buttons, real device insets)
configureScanner({ camera: ExpoCamera, paper: RNPaper, safeArea: SafeAreaContext })

<Scanner
  onScan={(result) => {
    console.log(result.type, result.data)
  }}
  timeout={30}
/>

// With photo capture
<Scanner
  mode="photo"
  onScan={handleScan}
  onPhoto={(photo) => {
    console.log(photo.uri)
  }}
/>`

const ScannerPage = () => {
  const theme = useTheme()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='@rific/scanner' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='headlineSmall'>Scanner</Text>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Full-screen barcode scanner for React Native with animated scan overlays, pinch-to-zoom, a timeout countdown ring, and scan deduplication. Wraps expo-camera with a ready-to-use scanning experience. react-native-paper and react-native-safe-area-context are optional: configure them once via configureScanner() for richer icon buttons and real device insets.
          </Text>

          <Surface style={[styles.installBox, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text style={[styles.code, { color: theme.colors.onSurfaceVariant }]}>npx expo install @rific/scanner expo-camera react-native-svg</Text>
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
            Key Props & Types
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

export default ScannerPage
