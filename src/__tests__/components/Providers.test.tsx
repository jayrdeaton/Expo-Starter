import { render } from '@testing-library/react-native'
import { Text } from 'react-native'

import { Providers } from '../../components/Providers'

const mockHapticProviderCalls: unknown[] = []
const mockUseUpdater = jest.fn()
const mockOnUpdateError = jest.fn()
jest.mock('@rific/auto-paper', () => ({
  Provider: (props: any) => props.children,
  themeActions: { initialize: (payload: unknown) => ({ payload, type: 'theme/initialize' }) },
  themeReducer: (state = { appearance: 'auto', blur: true, color: '#4caf50', harmony: 'split-complementary' }) => state,
  useThemeBridgeProps: (props: unknown) => props
}))

jest.mock('@rific/feedback-press', () => ({
  hapticActions: { initialize: (payload: unknown) => ({ payload, type: 'haptic/initialize' }) },
  soundActions: { initialize: (payload: unknown) => ({ payload, type: 'sound/initialize' }) },
  FeedbackPressProvider: (props: any) => {
    mockHapticProviderCalls.push(props)
    return props.children
  },
  hapticReducer: (state = { vibrate: true }) => state,
  soundReducer: (state = { enabled: false }) => state,
  useFeedbackBridgeProps: (props: unknown) => props
}))

jest.mock('@rific/toaster', () => ({
  HistoryModal: () => null,
  Toaster: () => null,
  ToastProvider: (props: any) => props.children,
  useUpdateErrorToast: () => mockOnUpdateError
}))

jest.mock('@rific/updater', () => ({
  useUpdater: (...args: unknown[]) => mockUseUpdater(...args)
}))

jest.mock('../../utils/splashGate', () => ({
  markSplashReady: jest.fn(),
  useSplashReady: jest.fn()
}))

beforeEach(() => {
  mockHapticProviderCalls.length = 0
  mockUseUpdater.mockClear()
})

describe('Providers', () => {
  it('renders without crashing', async () => {
    await expect(
      render(
        <Providers>
          <Text>test</Text>
        </Providers>
      )
    ).resolves.toBeDefined()
  })

  it('renders children', async () => {
    const { getByText } = await render(
      <Providers>
        <Text>app content</Text>
      </Providers>
    )
    expect(getByText('app content')).toBeTruthy()
  })

  it('passes vibrate=true (default) to FeedbackPressProvider', async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockHapticProviderCalls.length).toBeGreaterThan(0)
    expect(mockHapticProviderCalls[0]).toEqual(expect.objectContaining({ initialValue: expect.objectContaining({ vibrate: true }) }))
  })

  it('passes the persisted sound settings from the store to FeedbackPressProvider', async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockHapticProviderCalls.length).toBeGreaterThan(0)
    expect(mockHapticProviderCalls[0]).toEqual(expect.objectContaining({ soundInitialValue: expect.objectContaining({ enabled: false }) }))
  })

  it("routes useUpdater's onError through the update-error toast instead of the default Alert", async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockUseUpdater).toHaveBeenCalledWith({ onError: mockOnUpdateError })
  })
})
