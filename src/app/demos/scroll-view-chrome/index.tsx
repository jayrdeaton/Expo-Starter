import { ScrollViewChromeDemoScreen } from '@/components/ScrollViewChromeDemoScreen'

const FRUITS = ['Apple', 'Apricot', 'Avocado', 'Banana', 'Blackberry', 'Blueberry', 'Cherry', 'Coconut', 'Cranberry', 'Date', 'Dragon Fruit', 'Fig', 'Grape', 'Grapefruit', 'Guava', 'Kiwi', 'Lemon', 'Lime', 'Lychee', 'Mango', 'Melon', 'Nectarine', 'Orange', 'Papaya', 'Passion Fruit', 'Peach', 'Pear', 'Pineapple', 'Plum', 'Pomegranate', 'Raspberry', 'Strawberry', 'Tangerine', 'Watermelon']

const FruitsTab = () => <ScrollViewChromeDemoScreen items={FRUITS} title='Fruits' />

export default FruitsTab
