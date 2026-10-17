import { render } from '@testing-library/react-native'
import * as SplashScreen from 'expo-splash-screen'

import RootLayout from '../../app/_layout'

const mockStackProps: any[] = []
jest.mock('expo-router', () => ({
  Stack: Object.assign(
    (props: any) => {
      mockStackProps.push(props)
      return props.children
    },
    { Screen: () => null }
  )
}))

jest.mock('../../components/Providers', () => ({
  Providers: (props: any) => props.children
}))

const mockUseAutoPaperTheme = jest.fn(() => ({ dark: false }))
jest.mock('@rific/auto-paper', () => ({
  useAutoPaperTheme: () => mockUseAutoPaperTheme()
}))

beforeEach(() => {
  mockStackProps.length = 0
  mockUseAutoPaperTheme.mockReturnValue({ dark: false })
})

describe('RootLayout', () => {
  it('calls SplashScreen.preventAutoHideAsync on module load', () => {
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled()
  })

  it('calls SplashScreen.setOptions with fade animation on module load', () => {
    expect(SplashScreen.setOptions).toHaveBeenCalledWith({ duration: 500, fade: true })
  })

  it('renders without crashing', async () => {
    await expect(render(<RootLayout />)).resolves.toBeDefined()
  })

  // The status bar is set per screen, not by a React Native StatusBar (auto-paper's Provider gets
  // statusBar={false}), and follows the app's own theme rather than 'auto' (the system's).
  it('styles the status bar dark on a light theme', async () => {
    await render(<RootLayout />)
    expect(mockStackProps.at(-1).screenOptions).toEqual(expect.objectContaining({ statusBarStyle: 'dark' }))
  })

  it('styles the status bar light on a dark theme', async () => {
    mockUseAutoPaperTheme.mockReturnValue({ dark: true })
    await render(<RootLayout />)
    expect(mockStackProps.at(-1).screenOptions).toEqual(expect.objectContaining({ statusBarStyle: 'light' }))
  })
})
