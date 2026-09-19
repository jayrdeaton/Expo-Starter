import { Chip } from '@rific/feedback-press'
import { CustomList, PullSearch, type PullSearchHandle, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { FlashList } from '@shopify/flash-list'
import { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'

import { safeBack } from '@/utils/navigation'
import { timeout } from '@/utils/timeout'

const ALL_ITEMS = ['Apple', 'Apricot', 'Artichoke', 'Asparagus', 'Avocado', 'Banana', 'Barley', 'Blackberry', 'Blueberry', 'Broccoli', 'Brown Rice', 'Buckwheat', 'Bulgur', 'Carrot', 'Cauliflower', 'Celery', 'Cherry', 'Coconut', 'Corn', 'Cranberry', 'Cucumber', 'Date', 'Dragon Fruit', 'Eggplant', 'Farro', 'Fig', 'Freekeh', 'Garlic', 'Ginger', 'Grape', 'Grapefruit', 'Guava', 'Kamut', 'Kale', 'Kiwi', 'Lemon', 'Lettuce', 'Lime', 'Lychee', 'Mango', 'Melon', 'Millet', 'Mushroom', 'Nectarine', 'Oats', 'Onion', 'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Pepper', 'Pineapple', 'Plum', 'Pomegranate', 'Potato', 'Pumpkin', 'Quinoa', 'Raspberry', 'Rye', 'Sorghum', 'Spelt', 'Spinach', 'Strawberry', 'Tangerine', 'Teff', 'Tomato', 'Watermelon', 'Wheat', 'White Rice', 'Wild Rice', 'Zucchini']

type Item = { key: string; name: string; isLast: boolean }

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Item>)

const FlashListDemo = () => {
  const theme = useTheme()
  const scrollRef = useRef(null)
  const searchRef = useRef<PullSearchHandle>(null)
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [query, setQuery] = useState('')
  const [pullSearchHeight, setPullSearchHeight] = useState(0)

  const data = useMemo<Item[]>(() => {
    const q = query.toLowerCase()
    const source = q ? ALL_ITEMS.filter((name) => name.toLowerCase().includes(q)) : ALL_ITEMS
    const sorted = sort === 'asc' ? source : [...source].reverse()
    return sorted.map((name, i) => ({ key: name, name, isLast: i === sorted.length - 1 }))
  }, [query, sort])

  const handleChangeText = useCallback((text: string) => setQuery(text), [])

  const handleRefresh = useCallback(async () => {
    await timeout(3000)
  }, [])

  const listHeader = useMemo(
    () => (
      <View>
        <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Search…' ref={searchRef} />
        <View style={styles.filters}>
          <Chip compact selected={sort === 'asc'} onPress={() => setSort('asc')} icon='sort-alphabetical-ascending'>
            A–Z
          </Chip>
          <Chip compact selected={sort === 'desc'} onPress={() => setSort('desc')} icon='sort-alphabetical-descending'>
            Z–A
          </Chip>
        </View>
      </View>
    ),
    [handleChangeText, sort]
  )

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <View style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
          {item.name}
        </Text>
        {!item.isLast && <Divider style={styles.divider} />}
      </View>
    ),
    [theme]
  )

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} title='Flash List' />
        <CustomList component={AnimatedFlashList} data={data} keyExtractor={(item: Item) => item.key} ListHeaderComponent={listHeader} onRefresh={handleRefresh} pullSearchHeight={pullSearchHeight} renderItem={renderItem} scrollRef={scrollRef} />
        <ScrollViewFooter style={styles.footer}>
          <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            FlashList · CustomList
          </Text>
        </ScrollViewFooter>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  divider: { marginLeft: 16 },
  fill: { flex: 1 },
  filters: { flexDirection: 'row', gap: 8, paddingBottom: 8, paddingHorizontal: 8 },
  footer: { flex: 1, justifyContent: 'center' },
  item: { paddingHorizontal: 16, paddingVertical: 14 }
})

export default FlashListDemo
