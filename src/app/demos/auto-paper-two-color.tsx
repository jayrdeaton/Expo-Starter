import { ColorPicker, getThirdColor, useComputedTheme, useThemeSettings } from '@rific/auto-paper'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useMemo, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { Divider, Provider as PaperProvider, Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

// Alternating grid, just enough to show primary and secondary sitting on the derived tertiary surface together.
const PATTERN_ROWS = [
  ['primary', 'primary', 'secondary', 'secondary'],
  ['primary', 'primary', 'secondary', 'secondary'],
  ['secondary', 'secondary', 'primary', 'primary'],
  ['secondary', 'secondary', 'primary', 'primary']
] as const

const PatternPreview = () => {
  const { colors } = useTheme()
  return (
    <Surface style={[styles.pattern, { backgroundColor: colors.tertiaryContainer }]} elevation={1}>
      {PATTERN_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.patternRow}>
          {row.map((role, cellIndex) => (
            <View key={cellIndex} style={styles.patternCell}>
              <View style={[styles.dot, { backgroundColor: role === 'primary' ? colors.primary : colors.secondary }]} />
            </View>
          ))}
        </View>
      ))}
    </Surface>
  )
}

const RoleSwatches = () => {
  const { colors } = useTheme()
  const roles = [
    { label: 'Primary', bg: colors.primary, on: colors.onPrimary },
    { label: 'Secondary', bg: colors.secondary, on: colors.onSecondary },
    { label: 'Tertiary', bg: colors.tertiary, on: colors.onTertiary }
  ]
  return (
    <View style={styles.palette}>
      {roles.map((r) => (
        <Surface key={r.label} style={[styles.paletteChip, { backgroundColor: r.bg }]} elevation={2}>
          <Text variant='labelSmall' style={[styles.paletteLabel, { color: r.on }]}>
            {r.label}
          </Text>
          <Text variant='labelSmall' style={[styles.paletteHex, { color: r.on + 'B3' }]}>
            {r.bg}
          </Text>
        </Surface>
      ))}
    </View>
  )
}

const TwoColorDemo = () => {
  const theme = useTheme()
  const {
    settings: { appearance }
  } = useThemeSettings()

  const [primaryColor, setPrimaryColor] = useState('#f44336')
  const [secondaryColor, setSecondaryColor] = useState('#2196f3')

  const tertiaryColor = useMemo(() => getThirdColor(primaryColor, secondaryColor), [primaryColor, secondaryColor])

  const localTheme = useComputedTheme(appearance, { primary: primaryColor, secondary: secondaryColor, tertiary: tertiaryColor })

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Two-Color Theming' caption='@rific/auto-paper' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            {'Pick two colors and '}
            <Text variant='bodyMedium' style={styles.monospaceText}>
              getThirdColor(a, b)
            </Text>
            {' derives a third that stays maximally distinct from both. All three feed '}
            <Text variant='bodyMedium' style={styles.monospaceText}>
              useComputedTheme
            </Text>
            {' as an explicit '}
            <Text variant='bodyMedium' style={styles.monospaceText}>
              {'{ primary, secondary, tertiary }'}
            </Text>
            {' triad, no harmony math, each color used exactly as given.'}
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Primary
          </Text>
          <ColorPicker value={primaryColor} onChange={setPrimaryColor} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Secondary
          </Text>
          <ColorPicker value={secondaryColor} onChange={setSecondaryColor} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Derived Theme
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            The preview below is rendered under its own local theme, computed from the two colors above, without touching the app-wide theme.
          </Text>

          {localTheme ? (
            <PaperProvider theme={localTheme}>
              <Surface style={styles.matchSurface} elevation={0}>
                <PatternPreview />
                <RoleSwatches />
              </Surface>
            </PaperProvider>
          ) : null}
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  dot: { borderRadius: 12, height: 24, width: 24 },
  fill: { flex: 1 },
  hint: { marginBottom: 12 },
  matchSurface: { backgroundColor: 'transparent', gap: 16 },
  monospaceText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  palette: { flexDirection: 'row', gap: 8, marginTop: 16 },
  paletteChip: { alignItems: 'center', borderRadius: 10, flex: 1, padding: 12 },
  paletteHex: { marginTop: 4 },
  paletteLabel: { fontWeight: '700' },
  pattern: { alignSelf: 'center', borderRadius: 12, marginTop: 16, overflow: 'hidden', padding: 8 },
  patternCell: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  patternRow: { flexDirection: 'row' },
  sectionLabel: { marginBottom: 8 }
})

export default TwoColorDemo
