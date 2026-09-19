import { configureStore } from '@reduxjs/toolkit'
import { act, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Provider as ReduxProvider } from 'react-redux'

import { Theme } from '../../components/Theme'
import settingsReducer from '../../redux/settingsSlice'
import { markSplashReady, useSplashReady } from '../../utils/splashGate'

jest.mock('../../utils/splashGate', () => ({
  markSplashReady: jest.fn(),
  // A real (not mocked) useSplashReady would need a real createGate instance behind it.
  // Theme's own 'fonts' gate is driven by useFonts below, which the mock in jest.setup.ts already
  // resolves synchronously to `[true]`, so there's nothing useful this fake would add beyond not
  // throwing when Theme calls it.
  useSplashReady: jest.fn()
}))

// Keep provider spy in module scope so the factory closure can reference it.
const mockProviderCalls: unknown[] = []
jest.mock('@rific/auto-paper', () => ({
  Provider: (props: any) => {
    mockProviderCalls.push(props)
    return props.children
  },
  themeActions: { initialize: (payload: unknown) => ({ payload, type: 'theme/initialize' }) },
  useThemeBridgeProps: (props: unknown) => props
}))

const mockMarkSplashReady = markSplashReady as jest.Mock
const mockUseSplashReady = useSplashReady as jest.Mock

const makeStore = (themeState: { appearance: 'light' | 'dark' | 'system'; color: string } = { appearance: 'light', color: '#4caf50' }) =>
  configureStore({
    reducer: {
      settings: settingsReducer,
      theme: (state = themeState) => state
    }
  })

beforeEach(() => {
  jest.clearAllMocks()
  mockProviderCalls.length = 0
})

describe('Theme', () => {
  it('renders children', async () => {
    const { getByText } = await render(
      <ReduxProvider store={makeStore()}>
        <Theme>
          <Text>hello world</Text>
        </Theme>
      </ReduxProvider>
    )
    expect(getByText('hello world')).toBeTruthy()
  })

  it('passes appearance from Redux state to auto-paper Provider', async () => {
    await render(
      <ReduxProvider store={makeStore({ appearance: 'dark', color: '#4caf50' })}>
        <Theme>
          <Text>child</Text>
        </Theme>
      </ReduxProvider>
    )
    expect(mockProviderCalls.length).toBeGreaterThan(0)
    expect(mockProviderCalls[0]).toEqual(expect.objectContaining({ initialValue: expect.objectContaining({ appearance: 'dark' }) }))
  })

  it('passes color from Redux state to auto-paper Provider', async () => {
    await render(
      <ReduxProvider store={makeStore({ appearance: 'light', color: '#ff0000' })}>
        <Theme>
          <Text>child</Text>
        </Theme>
      </ReduxProvider>
    )
    expect(mockProviderCalls.length).toBeGreaterThan(0)
    expect(mockProviderCalls[0]).toEqual(expect.objectContaining({ initialValue: expect.objectContaining({ color: '#ff0000' }) }))
  })

  it('passes an onReady callback to auto-paper Provider', async () => {
    await render(
      <ReduxProvider store={makeStore()}>
        <Theme>
          <Text>child</Text>
        </Theme>
      </ReduxProvider>
    )
    expect(mockProviderCalls.length).toBeGreaterThan(0)
    const props = mockProviderCalls[0] as any
    expect(typeof props.onReady).toBe('function')
  })

  it("marks the 'theme' splash gate ready when onReady fires", async () => {
    await render(
      <ReduxProvider store={makeStore()}>
        <Theme>
          <Text>child</Text>
        </Theme>
      </ReduxProvider>
    )
    const props = mockProviderCalls[0] as any
    await act(async () => {
      props.onReady()
    })
    expect(mockMarkSplashReady).toHaveBeenCalledWith('theme')
  })

  // The icon font mock in jest.setup.ts resolves useFonts synchronously to [true]. See its own
  // comment for why every react-native-paper icon in this app depends on that exact font.
  it("marks the 'fonts' splash gate ready once the icon font resolves", async () => {
    await render(
      <ReduxProvider store={makeStore()}>
        <Theme>
          <Text>child</Text>
        </Theme>
      </ReduxProvider>
    )
    expect(mockUseSplashReady).toHaveBeenCalledWith('fonts', true)
  })
})
