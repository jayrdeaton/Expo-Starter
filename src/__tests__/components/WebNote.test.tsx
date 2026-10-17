import { render, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { WebNote } from '../../components/WebNote'

describe('WebNote', () => {
  it('renders nothing on native', async () => {
    await render(<WebNote>Native only</WebNote>)
    expect(screen.queryByText('Native only')).toBeNull()
  })

  it('renders on native when visible is passed', async () => {
    await render(<WebNote visible>Needs a phone</WebNote>)
    expect(screen.getByText('Needs a phone')).toBeTruthy()
  })

  it('renders its text on web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web')
    await render(<WebNote>Native only</WebNote>)
    expect(screen.getByText('Native only')).toBeTruthy()
  })
})
