import { render } from '@testing-library/react-native'
import * as SplashScreen from 'expo-splash-screen'

import RootLayout from '../../app/_layout'

jest.mock('expo-router', () => ({
  Stack: Object.assign((props: any) => props.children, { Screen: () => null })
}))

jest.mock('../../components/Providers', () => ({
  Providers: (props: any) => props.children
}))

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
})
