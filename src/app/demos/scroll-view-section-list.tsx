import { BlurView, useThemeSettings } from '@rific/auto-paper'
import { PullSearch, type PullSearchHandle, ScrollViewFooter, ScrollViewHeader, ScrollViewProvider, SectionList } from '@rific/scroll-view'
import { useCallback, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Divider, Text, useTheme } from 'react-native-paper'

import { safeBack } from '@/utils/navigation'

type FoodItem = { key: string; name: string }
type FoodSection = { title: string; data: FoodItem[] }

const ALL_SECTIONS: FoodSection[] = [
  {
    title: 'Citrus',
    data: [
      { key: 'grapefruit', name: 'Grapefruit' },
      { key: 'lemon', name: 'Lemon' },
      { key: 'lime', name: 'Lime' },
      { key: 'orange', name: 'Orange' },
      { key: 'tangerine', name: 'Tangerine' }
    ]
  },
  {
    title: 'Tropical',
    data: [
      { key: 'avocado', name: 'Avocado' },
      { key: 'coconut', name: 'Coconut' },
      { key: 'dragon-fruit', name: 'Dragon Fruit' },
      { key: 'guava', name: 'Guava' },
      { key: 'kiwi', name: 'Kiwi' },
      { key: 'lychee', name: 'Lychee' },
      { key: 'mango', name: 'Mango' },
      { key: 'papaya', name: 'Papaya' },
      { key: 'passion-fruit', name: 'Passion Fruit' },
      { key: 'pineapple', name: 'Pineapple' }
    ]
  },
  {
    title: 'Berries',
    data: [
      { key: 'blackberry', name: 'Blackberry' },
      { key: 'blueberry', name: 'Blueberry' },
      { key: 'cherry', name: 'Cherry' },
      { key: 'cranberry', name: 'Cranberry' },
      { key: 'grape', name: 'Grape' },
      { key: 'raspberry', name: 'Raspberry' },
      { key: 'strawberry', name: 'Strawberry' }
    ]
  },
  {
    title: 'Stone Fruit',
    data: [
      { key: 'apricot', name: 'Apricot' },
      { key: 'date', name: 'Date' },
      { key: 'fig', name: 'Fig' },
      { key: 'nectarine', name: 'Nectarine' },
      { key: 'peach', name: 'Peach' },
      { key: 'plum', name: 'Plum' }
    ]
  },
  {
    title: 'Other Fruit',
    data: [
      { key: 'apple', name: 'Apple' },
      { key: 'banana', name: 'Banana' },
      { key: 'melon', name: 'Melon' },
      { key: 'pear', name: 'Pear' },
      { key: 'pomegranate', name: 'Pomegranate' },
      { key: 'watermelon', name: 'Watermelon' }
    ]
  },
  {
    title: 'Vegetables',
    data: [
      { key: 'artichoke', name: 'Artichoke' },
      { key: 'asparagus', name: 'Asparagus' },
      { key: 'broccoli', name: 'Broccoli' },
      { key: 'carrot', name: 'Carrot' },
      { key: 'cauliflower', name: 'Cauliflower' },
      { key: 'celery', name: 'Celery' },
      { key: 'cucumber', name: 'Cucumber' },
      { key: 'eggplant', name: 'Eggplant' },
      { key: 'garlic', name: 'Garlic' },
      { key: 'ginger', name: 'Ginger' },
      { key: 'kale', name: 'Kale' },
      { key: 'lettuce', name: 'Lettuce' },
      { key: 'mushroom', name: 'Mushroom' },
      { key: 'onion', name: 'Onion' },
      { key: 'pepper', name: 'Pepper' },
      { key: 'potato', name: 'Potato' },
      { key: 'pumpkin', name: 'Pumpkin' },
      { key: 'spinach', name: 'Spinach' },
      { key: 'tomato', name: 'Tomato' },
      { key: 'zucchini', name: 'Zucchini' }
    ]
  }
]

const SectionListDemo = () => {
  const theme = useTheme()
  const {
    settings: { blur }
  } = useThemeSettings()
  const [query, setQuery] = useState('')
  const [pullSearchHeight, setPullSearchHeight] = useState(0)
  const searchRef = useRef<PullSearchHandle>(null)

  const sections = useMemo<FoodSection[]>(() => {
    const q = query.toLowerCase()
    if (!q) return ALL_SECTIONS
    return ALL_SECTIONS.map((s) => ({ ...s, data: s.data.filter((item) => item.name.toLowerCase().includes(q)) })).filter((s) => s.data.length > 0)
  }, [query])

  const handleChangeText = useCallback((text: string) => setQuery(text), [])

  const pullSearch = useMemo(() => <PullSearch onChangeText={handleChangeText} onHeightChange={setPullSearchHeight} placeholder='Search fruits & vegetables…' ref={searchRef} />, [handleChangeText])

  const renderItem = useCallback(
    ({ item, index, section }: { item: FoodItem; index: number; section: FoodSection }) => {
      const isLast = index === section.data.length - 1
      return (
        <View style={[styles.item, { backgroundColor: theme.colors.surfaceVariant }]}>
          <Text variant='bodyMedium' style={{ color: theme.colors.onSurfaceVariant }}>
            {item.name}
          </Text>
          {!isLast && <Divider style={styles.itemDivider} />}
        </View>
      )
    },
    [theme]
  )

  const renderSectionHeader = useCallback(
    ({ section }: { section: FoodSection }) => (
      <BlurView blur={blur} style={styles.sectionHeader}>
        <Text variant='titleSmall' style={{ color: theme.colors.primary }}>
          {section.title}
        </Text>
      </BlurView>
    ),
    [blur, theme]
  )

  const keyExtractor = useCallback((item: FoodItem) => item.key, [])

  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader backAction={safeBack} caption='@rific/scroll-view' title='Section List' />
        <SectionList keyExtractor={keyExtractor} ListHeaderComponent={pullSearch} pullSearchHeight={pullSearchHeight} renderItem={renderItem} renderSectionHeader={renderSectionHeader} sections={sections} stickySectionHeadersEnabled />
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
  fill: { flex: 1 },
  footer: { flex: 1, justifyContent: 'center' },
  item: { paddingHorizontal: 16, paddingVertical: 14 },
  itemDivider: { marginLeft: 16 },
  sectionHeader: { paddingHorizontal: 16, paddingVertical: 8 }
})

export default SectionListDemo
