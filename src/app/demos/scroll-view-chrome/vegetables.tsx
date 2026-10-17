import { ScrollViewChromeDemoScreen } from '@/components/ScrollViewChromeDemoScreen'

const VEGETABLES = ['Artichoke', 'Asparagus', 'Beet', 'Bok Choy', 'Broccoli', 'Brussels Sprout', 'Cabbage', 'Carrot', 'Cauliflower', 'Celery', 'Chard', 'Corn', 'Cucumber', 'Eggplant', 'Fennel', 'Garlic', 'Ginger', 'Green Bean', 'Kale', 'Leek', 'Lettuce', 'Mushroom', 'Okra', 'Onion', 'Parsnip', 'Pea', 'Pepper', 'Potato', 'Pumpkin', 'Radish', 'Spinach', 'Squash', 'Sweet Potato', 'Tomato', 'Turnip', 'Zucchini']

const VegetablesTab = () => <ScrollViewChromeDemoScreen items={VEGETABLES} title='Vegetables' />

export default VegetablesTab
