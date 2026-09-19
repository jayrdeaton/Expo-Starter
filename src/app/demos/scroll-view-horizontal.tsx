import { FlatList, ScrollViewContext, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useCallback, useContext, useMemo } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const PAGES = Array.from({ length: 20 }, (_, i) => ({
  key: String(i + 1),
  title: `Page ${i + 1}`,
  body: `Page ${i + 1} of 20`
}))

type Page = (typeof PAGES)[number]

const HorizontalContent = ({ onBack }: { onBack: () => void }) => {
  const theme = useTheme()
  const { width, height: windowHeight } = useWindowDimensions()
  const { headerHeight, footerHeight } = useContext(ScrollViewContext)
  const bgColors = useMemo(() => [theme.colors.primaryContainer, theme.colors.secondaryContainer, theme.colors.tertiaryContainer, theme.colors.errorContainer, theme.colors.surfaceVariant], [theme])

  const renderItem = useCallback(
    ({ item, index }: { item: Page; index: number }) => (
      <View style={[styles.page, { width, height: windowHeight, paddingTop: headerHeight, paddingBottom: footerHeight, backgroundColor: bgColors[index % bgColors.length] }]}>
        <Text variant='headlineMedium' style={[styles.pageTitle, { color: theme.colors.onSurface }]}>
          {item.title}
        </Text>
        <Text variant='bodyLarge' style={[styles.pageBody, { color: theme.colors.onSurfaceVariant }]}>
          {item.body}
        </Text>
      </View>
    ),
    [theme, width, windowHeight, headerHeight, footerHeight, bgColors]
  )

  return (
    <>
      <ScrollViewHeader backAction={onBack} caption='@rific/scroll-view' title='Horizontal' />
      <FlatList alwaysBounceVertical={false} data={PAGES} horizontal keyExtractor={(item) => item.key} pagingEnabled renderItem={renderItem} />
      <ScrollViewFooter style={styles.footer}>
        <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
          @rific/scroll-view
        </Text>
      </ScrollViewFooter>
    </>
  )
}

const HorizontalDemo = () => {
  const theme = useTheme()

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <HorizontalContent onBack={safeBack} />
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  footer: { flex: 1, justifyContent: 'center' },
  page: { alignItems: 'center', justifyContent: 'center' },
  pageBody: { marginTop: 12, textAlign: 'center' },
  pageTitle: { textAlign: 'center' }
})

export default HorizontalDemo
