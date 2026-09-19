import { Chip, SegmentedButtons } from '@rific/feedback-press'
import { CustomList, PullSearch, type PullSearchHandle, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useCallback, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'
import Animated from 'react-native-reanimated'

import { safeBack } from '@/utils/navigation'
import { timeout } from '@/utils/timeout'

type Tab = 'fruits' | 'vegetables' | 'grains'

const CONTENT: Record<Tab, string[]> = {
  fruits: ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragon Fruit', 'Fig', 'Grape', 'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime', 'Lychee', 'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine', 'Watermelon'],
  vegetables: ['Artichoke', 'Asparagus', 'Broccoli', 'Carrot', 'Cauliflower', 'Celery', 'Cucumber', 'Eggplant', 'Garlic', 'Ginger', 'Kale', 'Lettuce', 'Mushroom', 'Onion', 'Pepper', 'Potato', 'Pumpkin', 'Spinach', 'Tomato', 'Zucchini'],
  grains: ['Barley', 'Brown Rice', 'Buckwheat', 'Bulgur', 'Corn', 'Farro', 'Freekeh', 'Kamut', 'Millet', 'Oats', 'Quinoa', 'Rye', 'Sorghum', 'Spelt', 'Teff', 'Wheat', 'White Rice', 'Wild Rice']
}

type Item = { key: string; name: string; isLast: boolean }

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<Item>)

const CustomListDemo = () => {
  const theme = useTheme()
  const scrollRef = useRef(null)
  const searchRef = useRef<PullSearchHandle>(null)
  const [tab, setTab] = useState<Tab>('fruits')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [query, setQuery] = useState('')
  const [pullSearchHeight, setPullSearchHeight] = useState(0)

  const data = useMemo<Item[]>(() => {
    const q = query.toLowerCase()
    const source = q ? CONTENT[tab].filter((name) => name.toLowerCase().includes(q)) : CONTENT[tab]
    const sorted = sort === 'asc' ? source : [...source].reverse()
    return sorted.map((name, i) => ({ key: name, name, isLast: i === sorted.length - 1 }))
  }, [tab, query, sort])

  const handleChangeText = useCallback((text: string) => setQuery(text), [])

  const handleRefresh = useCallback(async () => {
    await timeout(3000)
  }, [])

  const centerContent = useMemo(
    () => (
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as Tab)}
        buttons={[
          { value: 'fruits', label: 'Fruits' },
          { value: 'vegetables', label: 'Veggies' },
          { value: 'grains', label: 'Grains' }
        ]}
        style={styles.segments}
        density='small'
      />
    ),
    [tab]
  )

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
        <ScrollViewHeader backAction={safeBack} centerContent={centerContent} />
        <CustomList component={AnimatedFlatList} data={data} keyExtractor={(item: Item) => item.key} ListHeaderComponent={listHeader} onRefresh={handleRefresh} pullSearchHeight={pullSearchHeight} renderItem={renderItem} scrollRef={scrollRef} />
        <ScrollViewFooter style={styles.footer}>
          <Text variant='labelMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            centerContent · CustomList
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
  item: { paddingHorizontal: 16, paddingVertical: 14 },
  segments: { marginHorizontal: 8 }
})

export default CustomListDemo
