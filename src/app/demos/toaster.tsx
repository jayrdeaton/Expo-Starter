import { Button } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { LEVEL_COLORS, useToast } from '@rific/toaster'
import { StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const ToasterDemo = () => {
  const theme = useTheme()
  const toast = useToast()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Toaster' caption='@rific/toaster' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Stacking, animated toast notifications with swipe-to-dismiss, a capped visible limit, and a history drawer. Toasts are triggered imperatively via a hook from anywhere in your component tree.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Toast Levels
          </Text>
          <View style={styles.row}>
            <Button mode='contained' icon='check-circle' buttonColor={LEVEL_COLORS.success} onPress={() => toast.success('Saved successfully')} compact>
              Success
            </Button>
            <Button mode='contained' icon='close-circle' buttonColor={LEVEL_COLORS.error} onPress={() => toast.error('Something went wrong')} compact>
              Error
            </Button>
            <Button mode='contained' icon='alert' buttonColor={LEVEL_COLORS.warning} onPress={() => toast.warning('Check your input')} compact>
              Warning
            </Button>
            <Button mode='contained' icon='information' buttonColor={LEVEL_COLORS.info} onPress={() => toast.info('Update available')} compact>
              Info
            </Button>
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            With Caption
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            A second string adds a subtitle line below the title.
          </Text>
          <View style={styles.row}>
            <Button mode='outlined' icon='check-circle' textColor={LEVEL_COLORS.success} onPress={() => toast.success('Record created', 'ID #4821 saved to database')} compact>
              Success + caption
            </Button>
            <Button mode='outlined' icon='close-circle' textColor={LEVEL_COLORS.error} onPress={() => toast.error('Upload failed', 'File exceeds 10 MB limit')} compact>
              Error + caption
            </Button>
            <Button mode='outlined' icon='alert' textColor={LEVEL_COLORS.warning} onPress={() => toast.warning('Session expiring', 'You will be logged out in 5 minutes')} compact>
              Warning + caption
            </Button>
          </View>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Stack Demo
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Fire multiple toasts quickly to see them stack, up to 3 visible at once (the Toaster&apos;s default limit).
          </Text>
          <Button
            mode='contained'
            icon='bell-ring'
            style={styles.item}
            onPress={() => {
              toast.success('First')
              setTimeout(() => toast.info('Second'), 250)
              setTimeout(() => toast.warning('Third'), 500)
            }}
          >
            Fire 3 Toasts
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Variable Height
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Captions and images make some toasts taller than others, so the stack now measures each card instead of assuming a fixed height, and nothing overlaps.
          </Text>
          <View style={styles.row}>
            <Button mode='outlined' icon='text' compact onPress={() => toast.info('Sync complete', 'We compared 1,204 records across three data sources and found 12 conflicts, which were resolved automatically using your default merge strategy. A full changelog is available anytime from account settings.')}>
              Long Caption
            </Button>
            <Button mode='outlined' icon='image' compact onPress={() => toast.success('Photo uploaded', 'Compressed and saved to your library', 'https://picsum.photos/200')}>
              With Image
            </Button>
          </View>
          <Button
            mode='outlined'
            icon='layers'
            style={styles.item}
            compact
            onPress={() => {
              toast.warning('Heads up')
              setTimeout(() => toast.info('New message', 'From Sarah'), 250)
              setTimeout(() => toast.success('Backup finished', 'All 48 photos in this album were uploaded and verified against the originals on your device, so nothing was lost in the process.', 'https://picsum.photos/200'), 500)
            }}
          >
            Mixed Stack
          </Button>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            History
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Every toast is logged to a history stack as it fires (the 100 most recent), accessible via a bottom drawer.
          </Text>
          <View style={styles.row}>
            <Button mode='outlined' icon='history' onPress={toast.openHistory}>
              View History ({toast.history.length})
            </Button>
            <Button mode='outlined' icon='bell-off' onPress={toast.clear}>
              Dismiss All
            </Button>
            <Button mode='outlined' icon='trash-can' onPress={toast.clearHistory}>
              Clear History
            </Button>
          </View>
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
  hint: { marginBottom: 12 },
  item: { marginBottom: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sectionLabel: { marginBottom: 8 }
})

export default ToasterDemo
