import { Button } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useUpdateErrorToast } from '@rific/toaster'
import { useUpdater } from '@rific/updater'
import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Chip, Divider, Surface, Text, useTheme } from 'react-native-paper'

import { release } from '@/constants/release'
import { safeBack } from '@/utils/navigation'

const INFO_ITEMS = [
  {
    label: 'autoCheck (default: true)',
    desc: 'Fetches updates once on mount, then registers an AppState listener that fetches again on every foreground resume. Set to false for full manual control.'
  },
  {
    label: 'autoPrompt (default: true)',
    desc: 'When a launch or foreground fetch finds an update, the confirm dialog opens on its own (no button needed) and the app reloads only if the user taps Restart. Set to false to stage it silently instead, surfaced via updateReady until check() or the next cold launch.'
  },
  {
    label: 'onConfirm callback',
    desc: 'Custom confirmation dialog in place of the default Alert. Called with the update manifest — return true to reload, false to cancel.'
  },
  {
    label: 'onError callback',
    desc: 'Called with the message when check() fails, or when an auto-prompted confirm/reload fails (failed background fetches stay silent), in place of the default Alert. This screen passes useUpdateErrorToast() from @rific/toaster so failures surface as an error toast instead.'
  },
  {
    label: 'onInfo callback',
    desc: "Custom handler for check()'s three purely-informational cases — dev-mode disabled, web unsupported, already up to date. Called with (title, message); no confirm/cancel choice involved. Defaults to Alert.alert like onError. Demoed below."
  },
  {
    label: 'updateReady',
    desc: 'True once a fetch has staged an update. Transient with the default autoPrompt: true; persists until check() runs when autoPrompt is false — useful for a settings badge. Only autoCheck fetches set it, so it stays false on this screen (autoCheck: false).'
  },
  {
    label: 'check()',
    desc: 'Manually triggers an update fetch (or reuses an already-staged manifest), then the confirm dialog and reload. Useful in a settings screen, debug panel, or pull-to-refresh handler.'
  }
]

const UpdaterDemo = () => {
  const theme = useTheme()
  const [info, setInfo] = useState<{ title: string; message: string } | null>(null)
  const onError = useUpdateErrorToast()
  const { check, checking } = useUpdater({
    autoCheck: false,
    onError,
    onInfo: (title, message) => setInfo({ title, message })
  })

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Updater' caption='@rific/updater' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            OTA update hook for Expo apps. Checks for updates on launch and on every foreground resume, and prompts to restart as soon as one&apos;s found. Exposes a manual check function, an optional confirmation callback before applying the update, and an onInfo callback for check()&apos;s informational messages — pass autoPrompt: false to stage updates silently instead.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Status
          </Text>
          <View style={styles.row}>
            <Chip icon={checking ? 'loading' : 'check-circle-outline'} selected={checking}>
              {checking ? 'Checking…' : 'Idle'}
            </Chip>
            <Chip icon={__DEV__ ? 'cloud-off-outline' : 'cloud-outline'}>{__DEV__ ? 'Checks disabled (dev)' : 'Manual checks only'}</Chip>
            <Chip icon='tag-outline'>OTA v{release.otaVersion}</Chip>
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Manual Check
          </Text>
          <Button mode='contained' onPress={check} disabled={checking} loading={checking}>
            {checking ? 'Checking…' : 'Check for Update'}
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Info Callback
          </Text>
          <Text variant='bodySmall' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            onInfo intercepts check()&apos;s purely-informational messages instead of falling back to a native Alert. In dev builds, tapping Check for Update above always triggers it; in a release build it fires when there&apos;s no update to apply.
          </Text>
          {info ? (
            <Surface style={[styles.infoCard, styles.infoCallbackCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
              <View style={[styles.infoItem, styles.infoItemFirst]}>
                <Text variant='labelMedium'>{info.title}</Text>
                <Text variant='bodySmall' style={[styles.infoItemDesc, { color: theme.colors.onSurfaceVariant }]}>
                  {info.message}
                </Text>
              </View>
            </Surface>
          ) : (
            <Chip icon='information-outline' style={styles.infoCallbackCard}>
              No info message yet
            </Chip>
          )}

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            How It Works
          </Text>
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            {INFO_ITEMS.map((item, i) => (
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
  container: { paddingHorizontal: 16, paddingTop: 16 },
  desc: { marginTop: 0 },
  divider: { marginVertical: 20 },
  fill: { flex: 1 },
  infoCallbackCard: { marginTop: 12 },
  infoCard: { borderRadius: 12 },
  infoItem: {
    borderTopColor: 'rgba(128,128,128,0.2)',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16
  },
  infoItemDesc: { marginTop: 4 },
  infoItemFirst: { borderTopWidth: 0 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionLabel: { marginBottom: 12 }
})

export default UpdaterDemo
