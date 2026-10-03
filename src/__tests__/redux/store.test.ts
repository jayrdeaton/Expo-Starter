import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore } from '@reduxjs/toolkit'
import { themeActions } from '@rific/auto-paper'
import { hapticActions, soundActions } from '@rific/feedback-press'
import { scrollViewActions } from '@rific/scroll-view'

import { defaultSettingsState, settingsActions } from '../../redux/settingsSlice'
import { persistConfig, persistor, rootReducer, store } from '../../redux/store'

// src/__mocks__/redux-persist.ts turns persistReducer/persistStore into stand-ins for every other
// test; the rehydrate round-trip below needs the real ones, against the preset's in-memory
// AsyncStorage.
const { persistReducer, persistStore } = jest.requireActual<typeof import('redux-persist')>('redux-persist')

// Captured at module load, before any test dispatches, so every test can start from the store's
// real initial state regardless of the order tests run in.
const initialState = store.getState()

describe('store', () => {
  beforeEach(() => {
    store.dispatch(themeActions.initialize(initialState.theme))
    store.dispatch(scrollViewActions.initialize(initialState.scrollView))
    store.dispatch(hapticActions.initialize(initialState.haptic))
    store.dispatch(soundActions.initialize(initialState.sound))
    store.dispatch(settingsActions.initialize(initialState.settings))
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

  describe('dispatch', () => {
    it('passes normal actions through to the reducer', () => {
      store.dispatch(settingsActions.setDebug(true))
      expect(store.getState().settings.debug).toBe(true)
    })

    // Every createAsyncThunk .rejected action carries an error field, so no middleware may drop
    // these, or a .rejected case in extraReducers would never run.
    it('delivers actions that carry an error field to the reducer', () => {
      store.dispatch({ type: 'settings/setDebug', payload: true, error: { message: 'Rejected' } } as never)
      expect(store.getState().settings.debug).toBe(true)
    })
  })

  describe('rehydrate', () => {
    afterEach(() => AsyncStorage.clear())

    // A blob persisted by an older build: theme has only `color`, settings has no fields at all.
    // redux-persist's default reconciler would hard-replace both slices with exactly that, so this
    // checks every slice backfills its defaults instead, and that each one reads its own key (the
    // backfill looks up payload[namespace], so the store key has to match the slice namespace).
    it('backfills fields missing from an older persisted blob, slice by slice', async () => {
      await AsyncStorage.setItem(
        'persist:root',
        JSON.stringify({
          haptic: JSON.stringify({ vibrate: false }),
          settings: JSON.stringify({}),
          theme: JSON.stringify({ color: '#ff0000' }),
          _persist: JSON.stringify({ rehydrated: true, version: -1 })
        })
      )
      const freshStore = configureStore({
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({ immutableCheck: false, serializableCheck: false }),
        reducer: persistReducer({ ...persistConfig, timeout: 0 }, rootReducer)
      })
      await new Promise<void>((resolve) => persistStore(freshStore, null, resolve))

      const state = freshStore.getState()
      expect(state.settings).toEqual(defaultSettingsState)
      expect(state.theme).toEqual({ ...initialState.theme, color: '#ff0000' })
      expect(state.haptic.vibrate).toBe(false)
    })
  })
})
