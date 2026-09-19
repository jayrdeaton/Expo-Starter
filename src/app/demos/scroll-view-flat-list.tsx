import { FlatList, PullSearch, type PullSearchHandle, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'
import { timeout } from '@/utils/timeout'

const ITEMS = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragon Fruit', 'Fig', 'Grape', 'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime', 'Lychee', 'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine', 'Watermelon', 'Artichoke', 'Asparagus', 'Broccoli', 'Carrot', 'Cauliflower', 'Celery', 'Cucumber', 'Eggplant', 'Garlic', 'Ginger', 'Kale', 'Lettuce', 'Mushroom', 'Onion', 'Pepper', 'Potato', 'Pumpkin', 'Spinach', 'Tomato', 'Zucchini']

type Item = { key: string }

const FlatListDemo = () => {
  const theme = useTheme()
  const [query, setQuery] = useState('')
  const [pullSearchHeight, setPullSearchHeight] = useState(0)
  const searchRef = useRef<PullSearchHandle>(null)

  const data = useMemo<Item[]>(() => {
    const q = query.toLowerCase()
    return (q ? ITEMS.filter((name) => name.toLowerCase().includes(q)) : ITEMS).map((name) => ({ key: name }))
  }, [query])

  const handleChangeText = useCallback((text: string) => setQuery(text), [])

  const handleRefresh = useCallback(async () => {
    await timeout(3000)
  }, [])

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <Surface elevation={0} style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
          {item.key}
        </Text>
      </Surface>
    ),
    [theme]
  )

  const pullSearch = useMemo(() => <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Search fruits & vegetables…' ref={searchRef} />, [handleChangeText])

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} caption='@rific/scroll-view' title='Flat List' />
        <FlatList contentContainerStyle={styles.container} data={data} keyExtractor={(item) => item.key} keyboardShouldPersistTaps='handled' ListHeaderComponent={pullSearch} onRefresh={handleRefresh} pullSearchHeight={pullSearchHeight} renderItem={renderItem} />
        <ScrollViewFooter style={styles.footer}>
          <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            @rific/scroll-view
          </Text>
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8 },
  fill: { flex: 1 },
  footer: { flex: 1, justifyContent: 'center' },
  item: { borderRadius: 8, marginBottom: 8, padding: 16 }
})

export default FlatListDemo
