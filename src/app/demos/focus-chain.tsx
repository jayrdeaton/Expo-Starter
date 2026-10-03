import { useFocusChain } from '@rific/focus-chain'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useToast } from '@rific/toaster'
import { useCallback } from 'react'
import { Keyboard, Platform, StyleSheet, View } from 'react-native'
import { Divider, Surface, Text, TextInput, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const FEATURES = ['Single hook, no manual ref bookkeeping, no state, no useEffect', 'Works with any focusable component (TextInput, custom inputs)', 'No React Native dependency, works in plain React too (wire onSubmitEditing to the Enter key on DOM inputs)', 'Call order determines focus order, no indices to manage', 'onSubmitEditing auto-wired to advance to the next field', 'Last field in the chain can submit the form']

const API_ITEMS = [
  { name: 'useFocusChain()', desc: 'Returns a register factory. Call once at the top of your component.' },
  { name: 'register()', desc: 'Call once per input in order. Returns { ref, props }.' },
  { name: 'ref', desc: "Pass to the input's ref prop directly. Kept out of props so a callback-ref never gets mistaken for a reactive value under the React Compiler." },
  { name: 'props.onSubmitEditing', desc: 'Spread via props. Focuses the next registered input automatically.' },
  { name: 'props.blurOnSubmit', desc: "Always false, so the keyboard stays up between fields. Dismiss it yourself in the last field's submit handler." },
  { name: 'props.focus()', desc: 'Imperatively focus this specific input from anywhere.' }
]

const USAGE = `import { useFocusChain } from '@rific/focus-chain'
import { Keyboard, TextInput } from 'react-native'

const MyForm = () => {
  const register = useFocusChain()
  const first = register()
  const second = register()
  const third = register()

  const handleSubmit = () => {
    // blurOnSubmit is always false, so Done won't dismiss the keyboard by itself
    Keyboard.dismiss()
  }

  return (
    <>
      <TextInput
        ref={first.ref}
        {...first.props}
        returnKeyType="next"
        placeholder="First name"
      />
      <TextInput
        ref={second.ref}
        {...second.props}
        returnKeyType="next"
        placeholder="Last name"
      />
      <TextInput
        ref={third.ref}
        {...third.props}
        returnKeyType="done"
        placeholder="Email"
        onSubmitEditing={handleSubmit}
      />
    </>
  )
}`

const FocusChainDemo = () => {
  const theme = useTheme()
  const register = useFocusChain()
  const { ref: firstRef, props: firstProps } = register()
  const { ref: secondRef, props: secondProps } = register()
  const { ref: thirdRef, props: thirdProps } = register()
  const { success } = useToast()

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss()
    success('Submitted!')
  }, [success])

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} caption='@rific/focus-chain' title='Focus Chain' />
        <ScrollView contentContainerStyle={styles.container} keyboardAware keyboardShouldPersistTaps='handled'>
          <Text variant='bodyMedium' style={[styles.desc, { color: theme.colors.onSurfaceVariant }]}>
            Auto-advancing focus chain for React form inputs, React Native or web. Call the hook once, then register() once per input in order: pass its ref and spread its props, and pressing Next or Return moves focus to the next field, with no index or ref bookkeeping.
          </Text>

          <Divider style={styles.divider} />
          <Text variant='titleMedium' style={styles.sectionLabel}>
            Try it
          </Text>
          <Text variant='bodySmall' style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
            Press Next (or Return) on your keyboard to move through the fields below. No manual ref wiring.
          </Text>
          <TextInput ref={firstRef} {...firstProps} label='First name' mode='outlined' returnKeyType='next' style={styles.input} />
          <TextInput ref={secondRef} {...secondProps} label='Last name' mode='outlined' returnKeyType='next' style={styles.input} />
          <TextInput ref={thirdRef} {...thirdProps} autoCapitalize='none' keyboardType='email-address' label='Email' mode='outlined' onSubmitEditing={handleSubmit} returnKeyType='done' style={styles.input} />

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
            API
          </Text>
          <Surface style={[styles.apiCard, { backgroundColor: theme.colors.surfaceVariant }]} elevation={0}>
            {API_ITEMS.map((item, i) => (
              <View key={item.name} style={[styles.apiItem, i === 0 && styles.apiItemFirst]}>
                <Text style={[styles.code, { color: theme.colors.primary }]}>{item.name}</Text>
                <Text variant='bodySmall' style={[styles.apiDesc, { color: theme.colors.onSurfaceVariant }]}>
                  {item.desc}
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
  apiDesc: { marginTop: 2 },
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
  hint: { marginBottom: 12 },
  input: { marginBottom: 12 },
  sectionLabel: { marginBottom: 12 }
})

export default FocusChainDemo
