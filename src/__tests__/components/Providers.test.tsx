import { useToast } from '@rific/toaster'
import { act, render } from '@testing-library/react-native'
import { Text } from 'react-native'
import { Portal } from 'react-native-paper'

import { Providers } from '../../components/Providers'

const mockFeedbackProviderCalls: unknown[] = []
const mockToasterCalls: any[] = []
const mockUseUpdater = jest.fn()
jest.mock('@rific/auto-paper', () => ({
  // The real Provider renders a portal host above everything Providers mounts inside Theme, so
  // the mock does too: that's what makes the portal test below meaningful.
  Provider: (props: any) => {
    const React = require('react')
    const { Portal: PaperPortal } = require('react-native-paper')
    return React.createElement(PaperPortal.Host, null, props.children)
  },
  BlurView: (props: any) => props.children,
  themeActions: { initialize: (payload: unknown) => ({ payload, type: 'theme/initialize' }) },
  themeReducer: (state = { appearance: 'system', blur: true, color: '#4caf50', harmony: 'split-complementary' }) => state,
  useAutoPaperTheme: () => ({ fonts: { bodyMedium: { fontFamily: 'Body', fontSize: 14 }, bodySmall: { fontFamily: 'Body', fontSize: 12 } } }),
  useBlur: () => true,
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
  // store.ts builds the sound slice's starting state from defaultSoundSettings, so that's where
  // the sound side's opposite default goes.
  defaultSoundSettings: { enabled: true },
  hapticReducer: (state = { vibrate: false }) => state,
  soundReducer: (state = { enabled: true }) => state,
  useFeedbackBridgeProps: (props: unknown) => props
}))

// Real ToastProvider/useUpdateErrorToast, so UpdateChecker has to actually sit inside the provider
// (the real hook throws outside it); only the rendering pieces are stubbed.
jest.mock('@rific/toaster', () => ({
  ...jest.requireActual('@rific/toaster'),
  HistoryModal: () => null,
  Toaster: (props: unknown) => {
    mockToasterCalls.push(props)
    return null
  }
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
  mockToasterCalls.length = 0
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

  it("draws toasts in the theme's type, on a custom card, with the drawer history", async () => {
    await render(
      <Providers>
        <Text>child</Text>
      </Providers>
    )
    expect(mockToasterCalls.length).toBeGreaterThan(0)
    const props = mockToasterCalls[0]
    expect(props.labelStyle).toEqual({ fontFamily: 'Body', fontSize: 14 })
    expect(props.captionStyle).toEqual({ fontFamily: 'Body', fontSize: 12 })
    expect(typeof props.Card).toBe('function')
    expect(props.historyModal).toBeTruthy()
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
