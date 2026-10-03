import { FeedbackPressProvider } from '@rific/feedback-press'
import { fireEvent, render } from '@testing-library/react-native'
import * as RNPaper from 'react-native-paper'

import HomeScreen from '../../app/(tabs)/index'

const mockPush = jest.fn()

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush })
}))

// react-native-paper is no longer auto-detected via require() inside @rific/feedback-press's
// <Button> - it must be injected via <FeedbackPressProvider paper={...}>, matching how the real
// app wires it in src/components/Providers.tsx.
const renderHomeScreen = () =>
  render(
    <FeedbackPressProvider paper={RNPaper}>
      <HomeScreen />
    </FeedbackPressProvider>
  )

beforeEach(() => {
  mockPush.mockClear()
})

describe('HomeScreen', () => {
  it('renders without crashing', async () => {
    await expect(renderHomeScreen()).resolves.toBeDefined()
  })

  it('displays the Expo Starter header', async () => {
    const { getByText } = await renderHomeScreen()
    expect(getByText('Expo Starter')).toBeTruthy()
  })

  it('every card button pushes a distinct route, @rific/core first', async () => {
    const { getAllByText } = await renderHomeScreen()
    const buttons = [...getAllByText('View Demo'), ...getAllByText('Learn More')]
    for (const button of buttons) await fireEvent.press(button)
    const routes = mockPush.mock.calls.map(([route]) => route)
    expect(routes).toHaveLength(buttons.length)
    expect(new Set(routes).size).toBe(routes.length)
    expect(routes[0]).toBe('/demos/core')
  })
})
