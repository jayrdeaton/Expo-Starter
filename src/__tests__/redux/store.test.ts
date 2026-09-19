import { hapticActions } from '@rific/feedback-press'
import { scrollViewActions } from '@rific/scroll-view'

import { settingsActions } from '../../redux/settingsSlice'
import { persistor, store } from '../../redux/store'

describe('store', () => {
  beforeEach(() => {
    store.dispatch(settingsActions.resetSettings())
  })

  describe('state shape', () => {
    it('has theme, scrollView, haptic, sound, and settings keys', () => {
      const state = store.getState()
      expect(state).toHaveProperty('theme')
      expect(state).toHaveProperty('scrollView')
      expect(state).toHaveProperty('haptic')
      expect(state).toHaveProperty('sound')
      expect(state).toHaveProperty('settings')
    })

    it('initializes theme defaults', () => {
      const { theme } = store.getState()
      expect(theme.appearance).toBe('system')
      expect(theme.blur).toBe(true)
      expect(theme.color).toBe('#6750a4')
      expect(theme.harmony).toBe('split-complementary')
    })

    it('initializes scrollView defaults', () => {
      const { scrollView } = store.getState()
      expect(scrollView.headerFixed).toBe(false)
      expect(scrollView.footerFixed).toBe(false)
      expect(scrollView.snapBack).toBe(false)
      expect(scrollView.backActionFixed).toBe(true)
    })

    it('initializes haptic defaults', () => {
      expect(store.getState().haptic.vibrate).toBe(true)
    })

    it('initializes sound defaults', () => {
      // @rific/feedback-press's own soundReducer defaults a never-persisted sound preference to
      // !__DEV__ (false here, since Jest runs with __DEV__ true) so local/Claude test runs stay
      // muted; production defaults to true.
      expect(store.getState().sound.enabled).toBe(!__DEV__)
    })

    it('initializes settings defaults', () => {
      expect(store.getState().settings.debug).toBe(false)
    })
  })

  describe('persistor', () => {
    it('is defined', () => {
      expect(persistor).toBeDefined()
    })
  })

  describe('errorMiddleware', () => {
    it('swallows actions that carry a truthy error field', () => {
      store.dispatch({ type: 'settings/setDebug', payload: true, error: true } as never)
      expect(store.getState().settings.debug).toBe(false)
    })

    it('passes normal actions through to the reducer', () => {
      store.dispatch(settingsActions.setDebug(true))
      expect(store.getState().settings.debug).toBe(true)
    })

    it('does not swallow actions whose error field is falsy', () => {
      store.dispatch({ type: 'haptic/setVibrate', payload: false, error: false } as never)
      expect(store.getState().haptic.vibrate).toBe(false)
    })

    it('does not swallow actions with no error field', () => {
      store.dispatch(hapticActions.setVibrate(false))
      expect(store.getState().haptic.vibrate).toBe(false)
    })

    it('passes scrollView actions through', () => {
      store.dispatch(scrollViewActions.initialize({ backActionFixed: true, footerFixed: true, headerFixed: true, snapBack: true }))
      expect(store.getState().scrollView.footerFixed).toBe(true)
    })
  })
})
