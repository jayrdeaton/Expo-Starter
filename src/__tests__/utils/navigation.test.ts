import { router } from 'expo-router'

import { safeBack } from '../../utils/navigation'

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() }
}))

const mockRouter = router as unknown as { back: jest.Mock; canGoBack: jest.Mock; replace: jest.Mock }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('safeBack', () => {
  it('goes back when there is history to pop', () => {
    mockRouter.canGoBack.mockReturnValue(true)
    safeBack()
    expect(mockRouter.back).toHaveBeenCalledTimes(1)
    expect(mockRouter.replace).not.toHaveBeenCalled()
  })

  it("falls back to '/' instead of erroring when there is nothing to go back to", () => {
    mockRouter.canGoBack.mockReturnValue(false)
    safeBack()
    expect(mockRouter.replace).toHaveBeenCalledWith('/')
    expect(mockRouter.back).not.toHaveBeenCalled()
  })
})
