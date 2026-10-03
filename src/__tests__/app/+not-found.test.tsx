import { render } from '@testing-library/react-native'
import React from 'react'
import { MD3LightTheme } from 'react-native-paper'

import NotFoundScreen from '../../app/+not-found'

jest.mock('expo-router', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => {
    const { Text } = require('react-native')
    return <Text testID={`link-${href}`}>{children}</Text>
  }
}))

describe('NotFoundScreen', () => {
  it('renders without crashing', async () => {
    await expect(render(<NotFoundScreen />)).resolves.toBeDefined()
  })

  it('shows an error message', async () => {
    const { getByText } = await render(<NotFoundScreen />)
    expect(getByText("This screen doesn't exist.")).toBeTruthy()
  })

  it('shows a link back to the home screen', async () => {
    const { getByText } = await render(<NotFoundScreen />)
    expect(getByText('Go to home screen')).toBeTruthy()
  })

  it('home link points to root', async () => {
    const { getByTestId } = await render(<NotFoundScreen />)
    expect(getByTestId('link-/')).toBeTruthy()
  })

  it('colors the home link with the theme primary color', async () => {
    const { getByText } = await render(<NotFoundScreen />)
    expect(getByText('Go to home screen')).toHaveStyle({ color: MD3LightTheme.colors.primary })
  })
})
