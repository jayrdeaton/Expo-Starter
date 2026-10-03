import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const FEATURES = ['6 cell modes: solid, gradient, density, stacked, dots, priority', 'Load-ripple, today-pulse, and press-spring animations, enabled with a single animated prop', 'Heatmap.Timeline variant: zoomable horizontal time-series view', 'Heatmap.Scatter variant for raw data distribution', 'Custom color scale with thresholds', 'Day and month label rendering', 'Tooltip with custom render function, pluralized unit label out of the box', 'Custom cell renderer for full control over appearance', 'onDayPress handler with date and data payload', 'Dark / light color scheme support', 'Auto-scaling from data range', 'Infinite scroll with onEndReached, extend endDate to append more weeks', 'Multi-category segments array for stacked/dots/priority cell modes']

const PROPS = [
  { name: 'data', type: 'DataPoint[]', desc: 'Required. Array of { date, value, color?, segments?, metadata? }; date is YYYY-MM-DD.' },
  { name: 'startDate / endDate', type: 'Date', desc: 'Range shown on the grid. Default: 1 year ago through today.' },
  { name: 'cellMode', type: 'CellMode', desc: '"solid" | "gradient" | "density" | "stacked" | "dots" | "priority". Default: "solid".' },
  { name: 'colorScale', type: 'Partial<ColorScale>', desc: 'Thresholds and colors used to shade cells. Default: a 5-step blue scale (#4183c4 light / #58a6ff dark), generated from color when set.' },
  { name: 'color', type: 'string', desc: 'Single accent color, overrides the default color scale.' },
  { name: 'colorScheme', type: '"light" | "dark"', desc: 'Switch between built-in light and dark palettes.' },
  { name: 'autoScale', type: 'boolean', desc: 'Scale cell intensity relative to the max value in data. Default: true.' },
  { name: 'animated', type: 'boolean', desc: 'Enable load ripple, today pulse, and press spring animations. Default: false.' },
  { name: 'showMonthLabels / showDayLabels', type: 'boolean', desc: 'Render month/day-of-week labels. Both default: true.' },
  { name: 'onDayPress', type: '(point: DataPoint | null, date: string) => void', desc: 'Called when a cell is tapped.' },
  { name: 'onEndReached', type: '() => void', desc: 'Called when the user scrolls near the right edge; use with endDate for infinite scroll.' },
  { name: 'renderTooltip / renderCell', type: 'function', desc: 'Replace the default tooltip or cell with a custom component.' }
]

const USAGE = `import Heatmap from '@rific/heatmap'

const data = [
  { date: '2026-01-15', value: 4 },
  { date: '2026-01-16', value: 12 },
  { date: '2026-01-17', value: 7 },
  // ...
]

<Heatmap.Calendar
  data={data}
  cellMode="gradient"
  color="#4caf50"
  animated
  showMonthLabels
  showDayLabels
  onDayPress={(point, date) => console.log(date, point?.value)}
/>

// Heatmap.Scatter (raw distribution) takes the same DataPoint[];
// Heatmap.Timeline (zoomable time-series) takes { timestamp, value }[]
// (TimelineDataPoint)`

const HeatmapPage = () => {
  const theme = useTheme()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='@rific/heatmap' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='headlineSmall'>Heatmap</Text>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            GitHub-style activity heatmap for React Native with SVG rendering. Supports six cell visualization modes, entrance/press animations, Timeline and Scatter variants alongside the default Calendar, and full customization of colors, labels, and tooltips.
          </Text>

          <Surface style={[styles.installBox, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            <Text style={[styles.code, { color: theme.colors.onSurfaceVariant }]}>npx expo install @rific/heatmap react-native-svg</Text>
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

export default HeatmapPage
