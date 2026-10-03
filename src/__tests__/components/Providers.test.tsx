import { useToast } from '@rific/toaster'
import { act, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Portal } from 'react-native-paper'

import { Providers } from '../../components/Providers'

const mockFeedbackProviderCalls: unknown[] = []
const mockUseUpdater = jest.fn()
jest.mock('@rific/auto-paper', () => ({
  // The real Provider renders a portal host above everything Providers mounts inside Theme, so
  // the mock does too: that's what makes the portal test below meaningful.
  Provider: (props: any) => {
    const React = require('react')
    const { Portal: PaperPortal } = require('react-native-paper')
    return React.createElement(PaperPortal.Host, null, props.children)
  },
  themeActions: { initialize: (payload: unknown) => ({ payload, type: 'theme/initialize' }) },
  themeReducer: (state = { appearance: 'system', blur: true, color: '#4caf50', harmony: 'split-complementary' }) => state,
  useThemeBridgeProps: (props: unknown) => props
}))

jest.mock('@rific/feedback-press', () => ({
  hapticActions: { initialize: (payload: unknown) => ({ payload, type: 'haptic/initialize' }) },
  soundActions: { initialize: (payload: unknown) => ({ payload, type: 'sound/initialize' }) },
  FeedbackPressProvider: (props: any) => {
    mockFeedbackProviderCalls.push(props)
    return props.children
  },
  // Deliberately the opposite of the package defaults (vibrate: true, enabled: !__DEV__), so the
  // 'from the store' assertions below fail if FeedbackBridge ever stops reading state.haptic/sound.
  hapticReducer: (state = { vibrate: false }) => state,
  soundReducer: (state = { enabled: true }) => state,
  useFeedbackBridgeProps: (props: unknown) => props
}))

// Real ToastProvider/useUpdateErrorToast, so UpdateChecker has to actually sit inside the provider
// (the real hook throws outside it); only the rendering pieces are stubbed.
jest.mock('@rific/toaster', () => ({
  ...jest.requireActual('@rific/toaster'),
  HistoryModal: () => null,
  Toaster: () => null
}))

jest.mock('@rific/updater', () => ({
  useUpdater: (...args: unknown[]) => mockUseUpdater(...args)
}))

jest.mock('../../utils/splashGate', () => ({
  markSplashReady: jest.fn(),
  useSplashReady: jest.fn()
}))

const ToastContextProbe = () => {
  useToast()
  return <Text>portal sees the toast context</Text>
}

const ToastTitles = () => {
  const { toasts } = useToast()
  return toasts.map((toast) => <Text key={toast.id}>{toast.title}</Text>)
}

beforeEach(() => {
  mockFeedbackProviderCalls.length = 0
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

  it('passes the persisted haptic settings from the store to FeedbackPressProvider', async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockFeedbackProviderCalls.length).toBeGreaterThan(0)
    expect(mockFeedbackProviderCalls[0]).toEqual(expect.objectContaining({ initialValue: expect.objectContaining({ vibrate: false }) }))
  })

  it('passes the persisted sound settings from the store to FeedbackPressProvider', async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockFeedbackProviderCalls.length).toBeGreaterThan(0)
    expect(mockFeedbackProviderCalls[0]).toEqual(expect.objectContaining({ soundInitialValue: expect.objectContaining({ enabled: true }) }))
  })

  it("routes useUpdater's onError through the update-error toast instead of the default Alert", async () => {
    const { getByText } = await render(
      <Providers>
        <ToastTitles />
      </Providers>
    )
    expect(mockUseUpdater).toHaveBeenCalledWith({ onError: expect.any(Function) })
    const [{ onError }] = mockUseUpdater.mock.calls[0]
    await act(async () => {
      onError('network unavailable')
    })
    expect(getByText('Update check failed')).toBeTruthy()
  })

  // Dialog/Menu content renders through a Portal; without the host inside ToastProvider it would
  // mount at Theme's host instead, above ToastProvider, and useToast would throw.
  it('lets portaled content (dialogs, menus) use the toast context', async () => {
    const { getByText } = await render(
      <Providers>
        <Portal>
          <ToastContextProbe />
        </Portal>
      </Providers>
    )
    expect(getByText('portal sees the toast context')).toBeTruthy()
  })
})
