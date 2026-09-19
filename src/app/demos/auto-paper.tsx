import { AppearancePicker, AutoAppearancePicker, AutoPalettePicker, ColorPicker, Dialog, HarmonyPicker, Menu, PalettePicker, useAutoPaperTheme, useThemeSettings } from '@rific/auto-paper'
import { Button, Switch } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { Stack, useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Dialog as PaperDialog, Divider, Menu as PaperMenu, Surface, Text } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const AutoPaperDemo = () => {
  const router = useRouter()
  // useAutoPaperTheme() is a typed drop-in for react-native-paper's own useTheme(): same theme,
  // with colors.success/warning/danger (and their on*/Container variants) typed in.
  const theme = useAutoPaperTheme()
  const {
    settings: { appearance, blur, color, harmony },
    set
  } = useThemeSettings()

  const [dialogVisible, setDialogVisible] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)

  // ColorPicker/PalettePicker only take a single seed string. This app's own settings screen
  // never puts the global theme into explicit-triad mode, but `color` is typed for that
  // possibility (see the Two-Color Theming demo below), so narrow it defensively here.
  const seedColor = typeof color === 'string' ? color : color.primary

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Auto Paper' caption='@rific/auto-paper' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Derives a full Material 3 triadic palette from a single seed color and wires it to system, light, or dark appearance automatically. Theme changes propagate instantly across the entire app.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Seed Color
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Tap a swatch and the whole app re-themes live.
          </Text>
          <ColorPicker value={seedColor} onChange={(c) => set({ color: c })} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Palette Picker
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Same seed swatches, but each one previews its full triadic palette as a pie instead of a flat color. Pass onHarmonyChange to fold a compact harmony row into the same dialog — open it and try changing harmony right there, every pie reshapes live.
          </Text>
          <PalettePicker value={seedColor} onChange={(c) => set({ color: c })} harmony={harmony} onHarmonyChange={(h) => set({ harmony: h })} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Appearance
          </Text>
          <AppearancePicker value={appearance} onChange={(a) => set({ appearance: a })} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Color Harmony
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Controls how secondary and tertiary colors are derived from the seed.
          </Text>
          <HarmonyPicker value={harmony} onChange={(h) => set({ harmony: h })} />

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Auto Pickers
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            AutoAppearancePicker and AutoPalettePicker are the same pickers as above, pre-wired straight to this app&apos;s live theme — no value/onChange (or harmony/onHarmonyChange) to pass, they read/write useThemeSettings() internally. Reach for the plain versions instead when a picker needs to be controlled by something other than the global theme, e.g. a local preview before committing.
          </Text>
          <View style={styles.autoPickersRow}>
            <View style={styles.autoPickerCol}>
              <Text variant='labelLarge' style={[styles.autoPickerLabel, { color: theme.colors.onSurfaceVariant }]}>
                Appearance
              </Text>
              <AutoAppearancePicker />
            </View>
            <View style={styles.autoPickerCol}>
              <Text variant='labelLarge' style={[styles.autoPickerLabel, { color: theme.colors.onSurfaceVariant }]}>
                Palette + Harmony
              </Text>
              <AutoPalettePicker />
            </View>
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Blur Mode
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Dialog and Menu components support a blur backdrop. Toggle to compare.
          </Text>
          <View style={styles.blurRow}>
            <Text variant='bodyMedium'>Blur enabled</Text>
            <Switch value={blur} onValueChange={(v) => set({ blur: v })} />
          </View>
          <View style={styles.blurButtons}>
            <Button mode='outlined' onPress={() => setDialogVisible(true)}>
              Open Dialog
            </Button>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button mode='outlined' onPress={() => setMenuVisible(true)}>
                  Open Menu
                </Button>
              }
            >
              <PaperMenu.Item onPress={() => setMenuVisible(false)} title='Option A' />
              <PaperMenu.Item onPress={() => setMenuVisible(false)} title='Option B' />
              <PaperMenu.Item onPress={() => setMenuVisible(false)} title='Option C' />
            </Menu>
          </View>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <PaperDialog.Title>{`Blur ${blur ? 'On' : 'Off'}`}</PaperDialog.Title>
            <PaperDialog.Content>
              <Text variant='bodyMedium'>{`This dialog is rendered ${blur ? 'with' : 'without'} the blur backdrop.`}</Text>
            </PaperDialog.Content>
            <PaperDialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Close</Button>
            </PaperDialog.Actions>
          </Dialog>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Derived Palette
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Primary, secondary, and tertiary derived from the seed using the selected harmony.
          </Text>
          <View style={styles.palette}>
            {[
              { label: 'Primary', bg: theme.colors.primary, on: theme.colors.onPrimary },
              { label: 'Secondary', bg: theme.colors.secondary, on: theme.colors.onSecondary },
              { label: 'Tertiary', bg: theme.colors.tertiary, on: theme.colors.onTertiary }
            ].map((p) => (
              <Surface key={p.label} style={[styles.paletteChip, { backgroundColor: p.bg }]} elevation={2}>
                <Text variant='labelSmall' style={[styles.paletteLabel, { color: p.on }]}>
                  {p.label}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteHex, { color: p.on + 'B3' }]}>
                  {p.bg}
                </Text>
              </Surface>
            ))}
          </View>
          <View style={[styles.palette, styles.paletteRow]}>
            {[
              { label: 'Primary', sublabel: 'Container', bg: theme.colors.primaryContainer, on: theme.colors.onPrimaryContainer },
              { label: 'Secondary', sublabel: 'Container', bg: theme.colors.secondaryContainer, on: theme.colors.onSecondaryContainer },
              { label: 'Tertiary', sublabel: 'Container', bg: theme.colors.tertiaryContainer, on: theme.colors.onTertiaryContainer }
            ].map((p) => (
              <Surface key={p.label} style={[styles.paletteChip, { backgroundColor: p.bg }]} elevation={2}>
                <Text variant='labelSmall' style={[styles.paletteLabel, { color: p.on }]}>
                  {p.label}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteSublabel, { color: p.on }]}>
                  {p.sublabel}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteHex, { color: p.on + 'B3' }]}>
                  {p.bg}
                </Text>
              </Surface>
            ))}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Two-Color Theming
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            {'Instead of one seed + harmony, '}
            <Text variant='bodySmall' style={styles.monospaceText}>
              color
            </Text>
            {' also accepts an explicit '}
            <Text variant='bodySmall' style={styles.monospaceText}>
              {'{ primary, secondary, tertiary }'}
            </Text>
            {' triad, each color used exactly as given. Paired with '}
            <Text variant='bodySmall' style={styles.monospaceText}>
              getThirdColor
            </Text>
            {', any two arbitrary colors can derive a third that stays maximally distinct from both.'}
          </Text>
          <Button mode='outlined' onPress={() => router.push('/demos/auto-paper-two-color')}>
            Open example
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Semantic Colors
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            success/warning/danger are fixed brand colors, not derived from the seed, exposed via useAutoPaperTheme() with full type safety. danger stays separate from MD3&apos;s own error, which Paper components (TextInput, HelperText) read directly.
          </Text>
          <View style={styles.palette}>
            {[
              { label: 'Success', bg: theme.colors.success, on: theme.colors.onSuccess },
              { label: 'Warning', bg: theme.colors.warning, on: theme.colors.onWarning },
              { label: 'Danger', bg: theme.colors.danger, on: theme.colors.onDanger }
            ].map((p) => (
              <Surface key={p.label} style={[styles.paletteChip, { backgroundColor: p.bg }]} elevation={2}>
                <Text variant='labelSmall' style={[styles.paletteLabel, { color: p.on }]}>
                  {p.label}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteHex, { color: p.on + 'B3' }]}>
                  {p.bg}
                </Text>
              </Surface>
            ))}
          </View>
          <View style={[styles.palette, styles.paletteRow]}>
            {[
              { label: 'Success', sublabel: 'Container', bg: theme.colors.successContainer, on: theme.colors.onSuccessContainer },
              { label: 'Warning', sublabel: 'Container', bg: theme.colors.warningContainer, on: theme.colors.onWarningContainer },
              { label: 'Danger', sublabel: 'Container', bg: theme.colors.dangerContainer, on: theme.colors.onDangerContainer }
            ].map((p) => (
              <Surface key={p.label} style={[styles.paletteChip, { backgroundColor: p.bg }]} elevation={2}>
                <Text variant='labelSmall' style={[styles.paletteLabel, { color: p.on }]}>
                  {p.label}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteSublabel, { color: p.on }]}>
                  {p.sublabel}
                </Text>
                <Text variant='labelSmall' style={[styles.paletteHex, { color: p.on + 'B3' }]}>
                  {p.bg}
                </Text>
              </Surface>
            ))}
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Live Theme Colors
          </Text>
          {[
            { label: 'primary', value: theme.colors.primary },
            { label: 'onPrimary', value: theme.colors.onPrimary },
            { label: 'primaryContainer', value: theme.colors.primaryContainer },
            { label: 'onPrimaryContainer', value: theme.colors.onPrimaryContainer },
            { label: 'secondary', value: theme.colors.secondary },
            { label: 'onSecondary', value: theme.colors.onSecondary },
            { label: 'secondaryContainer', value: theme.colors.secondaryContainer },
            { label: 'onSecondaryContainer', value: theme.colors.onSecondaryContainer },
            { label: 'tertiary', value: theme.colors.tertiary },
            { label: 'onTertiary', value: theme.colors.onTertiary },
            { label: 'tertiaryContainer', value: theme.colors.tertiaryContainer },
            { label: 'onTertiaryContainer', value: theme.colors.onTertiaryContainer },
            { label: 'error', value: theme.colors.error },
            { label: 'onError', value: theme.colors.onError },
            { label: 'errorContainer', value: theme.colors.errorContainer },
            { label: 'onErrorContainer', value: theme.colors.onErrorContainer },
            { label: 'success', value: theme.colors.success },
            { label: 'onSuccess', value: theme.colors.onSuccess },
            { label: 'successContainer', value: theme.colors.successContainer },
            { label: 'onSuccessContainer', value: theme.colors.onSuccessContainer },
            { label: 'warning', value: theme.colors.warning },
            { label: 'onWarning', value: theme.colors.onWarning },
            { label: 'warningContainer', value: theme.colors.warningContainer },
            { label: 'onWarningContainer', value: theme.colors.onWarningContainer },
            { label: 'danger', value: theme.colors.danger },
            { label: 'onDanger', value: theme.colors.onDanger },
            { label: 'dangerContainer', value: theme.colors.dangerContainer },
            { label: 'onDangerContainer', value: theme.colors.onDangerContainer },
            { label: 'background', value: theme.colors.background },
            { label: 'onBackground', value: theme.colors.onBackground },
            { label: 'surface', value: theme.colors.surface },
            { label: 'onSurface', value: theme.colors.onSurface },
            { label: 'surfaceVariant', value: theme.colors.surfaceVariant },
            { label: 'onSurfaceVariant', value: theme.colors.onSurfaceVariant },
            { label: 'surfaceDisabled', value: theme.colors.surfaceDisabled },
            { label: 'onSurfaceDisabled', value: theme.colors.onSurfaceDisabled },
            { label: 'inverseSurface', value: theme.colors.inverseSurface },
            { label: 'inverseOnSurface', value: theme.colors.inverseOnSurface },
            { label: 'inversePrimary', value: theme.colors.inversePrimary },
            { label: 'outline', value: theme.colors.outline },
            { label: 'outlineVariant', value: theme.colors.outlineVariant },
            { label: 'shadow', value: theme.colors.shadow },
            { label: 'scrim', value: theme.colors.scrim },
            { label: 'backdrop', value: theme.colors.backdrop }
          ].map(({ label, value: hex }) => (
            <View key={label} style={styles.colorRow}>
              <View style={[styles.colorDot, { backgroundColor: hex }]} />
              <Text variant='bodySmall' style={[styles.fill, { color: theme.colors.onSurfaceVariant }]}>
                {label}
              </Text>
              <Text variant='bodySmall' style={{ color: theme.colors.onSurfaceVariant }}>
                {hex}
              </Text>
            </View>
          ))}
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  autoPickerCol: { alignItems: 'flex-start', gap: 8 },
  autoPickerLabel: { marginBottom: 0 },
  autoPickersRow: { flexDirection: 'row', gap: 32 },
  blurButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  blurRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  colorDot: { borderRadius: 12, height: 24, width: 24 },
  colorRow: { alignItems: 'center', flexDirection: 'row', gap: 12, paddingVertical: 8 },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  fill: { flex: 1 },
  hint: { marginBottom: 12 },
  monospaceText: { fontFamily: 'monospace' },
  palette: { flexDirection: 'row', gap: 8 },
  paletteChip: { alignItems: 'center', borderRadius: 10, flex: 1, padding: 12 },
  paletteHex: { marginTop: 4 },
  paletteLabel: { fontWeight: '700' },
  paletteRow: { marginTop: 8 },
  paletteSublabel: { opacity: 0.6 },
  sectionLabel: { marginBottom: 8 }
})

export default AutoPaperDemo
