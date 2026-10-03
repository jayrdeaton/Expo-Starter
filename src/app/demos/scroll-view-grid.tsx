import { SegmentedButtons } from '@rific/feedback-press'
import { FlatList, PullSearch, type PullSearchHandle, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Surface, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

const ITEMS = ['Apple', 'Apricot', 'Artichoke', 'Asparagus', 'Avocado', 'Banana', 'Barley', 'Blackberry', 'Blueberry', 'Broccoli', 'Brown Rice', 'Buckwheat', 'Bulgur', 'Carrot', 'Cauliflower', 'Celery', 'Cherry', 'Coconut', 'Corn', 'Cranberry', 'Cucumber', 'Date', 'Dragon Fruit', 'Eggplant', 'Farro', 'Fig', 'Freekeh', 'Garlic', 'Ginger', 'Grape', 'Grapefruit', 'Guava', 'Kamut', 'Kale', 'Kiwi', 'Lemon', 'Lettuce', 'Lime', 'Lychee', 'Mango', 'Melon', 'Millet', 'Mushroom', 'Nectarine', 'Oats', 'Onion', 'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Pepper', 'Pineapple', 'Plum', 'Pomegranate', 'Potato', 'Pumpkin', 'Quinoa', 'Raspberry', 'Rye', 'Sorghum', 'Spelt', 'Spinach', 'Strawberry', 'Tangerine', 'Teff', 'Tomato', 'Watermelon', 'Wheat', 'White Rice', 'Wild Rice', 'Zucchini']

type Item = { key: string }
type Mode = 'list' | 'grid'

const COLUMNS = 3
const GAP = 8

const GridDemo = () => {
  const theme = useTheme()
  const { width } = useWindowDimensions()
  const [mode, setMode] = useState<Mode>('list')
  const numColumns = mode === 'grid' ? COLUMNS : 1
  const tileWidth = (width - 2 * GAP - (COLUMNS - 1) * GAP) / COLUMNS

  const [query, setQuery] = useState('')
  const [pullSearchHeight, setPullSearchHeight] = useState(0)
  const searchRef = useRef<PullSearchHandle>(null)
  const handleChangeText = useCallback((text: string) => setQuery(text), [])

  const data = useMemo<Item[]>(() => {
    const q = query.toLowerCase()
    return (q ? ITEMS.filter((name) => name.toLowerCase().includes(q)) : ITEMS).map((name) => ({ key: name }))
  }, [query])

  const listHeader = useMemo(() => <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Search fruits, vegetables & grains…' ref={searchRef} />, [handleChangeText])

  const centerContent = useMemo(
    () => (
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as Mode)}
        buttons={[
          { value: 'list', label: 'List', icon: 'view-agenda-outline' },
          { value: 'grid', label: 'Grid', icon: 'view-grid-outline' }
        ]}
        style={styles.segments}
        density='small'
      />
    ),
    [mode]
  )

  const renderItem = useCallback(
    ({ item }: { item: Item }) =>
      mode === 'grid' ? (
        <Surface elevation={0} style={[styles.gridItem, { backgroundColor: theme.colors.surfaceVariant, maxWidth: tileWidth }]}>
          <Text variant='labelMedium' numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            {item.key}
          </Text>
        </Surface>
      ) : (
        <Surface elevation={0} style={[styles.listItem, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            {item.key}
          </Text>
        </Surface>
      ),
    [mode, theme, tileWidth]
  )

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} centerContent={centerContent} />
        <FlatList columnWrapperStyle={mode === 'grid' ? styles.row : undefined} contentContainerStyle={styles.container} data={data} keyboardShouldPersistTaps='handled' keyExtractor={(item) => item.key} ListHeaderComponent={listHeader} numColumns={numColumns} pullSearchHeight={pullSearchHeight} renderItem={renderItem} />
        <ScrollViewFooter style={styles.footer}>
          <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            @rific/scroll-view · numColumns
          </Text>
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: GAP },
  fill: { flex: 1 },
  footer: { flex: 1, justifyContent: 'center' },
  gridItem: { alignItems: 'center', aspectRatio: 1, borderRadius: 8, flex: 1, justifyContent: 'center', marginBottom: 8, padding: 8 },
  listItem: { borderRadius: 8, marginBottom: 8, padding: 16 },
  row: { gap: GAP },
  segments: { marginHorizontal: 8 }
})

export default GridDemo
