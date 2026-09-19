import { Button, Switch } from '@rific/feedback-press'
import { ScrollView, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useCallback, useState } from 'react'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { Text, TextInput, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const KeyboardDemo = () => {
  const theme = useTheme()
  const [keyboardAware, setKeyboardAware] = useState(true)
  const [footerAboveKeyboard, setFooterAboveKeyboard] = useState(true)
  const handleDismiss = useCallback(() => Keyboard.dismiss(), [])

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider footerAboveKeyboard={footerAboveKeyboard} footerFixed>
        <ScrollViewHeader backAction={safeBack} caption='@rific/scroll-view' title='Keyboard Aware' />
        <ScrollView contentContainerStyle={styles.container} keyboardAware={keyboardAware} keyboardShouldPersistTaps='handled'>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            When enabled, the scroll view adds the keyboard height to its bottom content inset, so focused fields near the bottom of the form stay above the keyboard instead of getting hidden behind it.
          </Text>
          {Platform.OS === 'web' && (
            <Text variant='bodySmall' style={[styles.webNote, { color: theme.colors.error }]}>
              keyboardAware has no effect on web. Try this demo on iOS or Android to see the keyboard push content out of the way.
            </Text>
          )}

          <View style={styles.row}>
            <Text variant='bodyMedium'>Keyboard aware</Text>
            <Switch value={keyboardAware} onValueChange={setKeyboardAware} />
          </View>
          <View style={styles.row}>
            <Text variant='bodyMedium'>Footer above keyboard</Text>
            <Switch value={footerAboveKeyboard} onValueChange={setFooterAboveKeyboard} />
          </View>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            The footer below holds Cancel and Done. With this on, the fixed footer floats above the keyboard instead of getting covered by it, so these stay reachable without dismissing the keyboard first. Pressing either one blurs the focused field, so the keyboard animates away.
          </Text>

          <TextInput label='Full name' mode='outlined' style={styles.input} />
          <TextInput label='Email' mode='outlined' keyboardType='email-address' autoCapitalize='none' style={styles.input} />
          <TextInput label='Phone' mode='outlined' keyboardType='phone-pad' style={styles.input} />
          <TextInput label='Address line 1' mode='outlined' style={styles.input} />
          <TextInput label='Address line 2' mode='outlined' style={styles.input} />
          <TextInput label='City' mode='outlined' style={styles.input} />
          <TextInput label='State' mode='outlined' style={styles.input} />
          <TextInput label='ZIP code' mode='outlined' keyboardType='number-pad' style={styles.input} />
          <TextInput label='Notes' mode='outlined' multiline numberOfLines={4} style={styles.input} />
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Focus the field below. It&apos;s the one most likely to end up behind the keyboard.
          </Text>
          <TextInput label='Last field' mode='outlined' style={styles.input} />
        </ScrollView>
        <ScrollViewFooter style={styles.footer}>
          <Button mode='outlined' onPress={handleDismiss}>
            Cancel
          </Button>
          <Button mode='contained' onPress={handleDismiss}>
            Done
          </Button>
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  desc: { marginTop: 16 },
  fill: { flex: 1 },
  footer: { justifyContent: 'space-between', paddingHorizontal: 16 },
  hint: { marginBottom: 8, marginTop: 4 },
  input: { marginBottom: 12 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 12 },
  webNote: { marginTop: 8 }
})

export default KeyboardDemo
