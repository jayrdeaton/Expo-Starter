import settingsReducer, { defaultSettingsState, settingsActions, type SettingsState } from '../../redux/settingsSlice'

describe('settingsSlice', () => {
  describe('initial state', () => {
    it('sets debug to false', () => {
      expect(settingsReducer(undefined, { type: '@@INIT' }).debug).toBe(false)
    })

    it('matches defaultSettingsState', () => {
      expect(settingsReducer(undefined, { type: '@@INIT' })).toEqual(defaultSettingsState)
    })
  })

  describe('setDebug', () => {
    it('sets debug to true', () => {
      const state = settingsReducer(defaultSettingsState, settingsActions.setDebug(true))
      expect(state.debug).toBe(true)
    })

    it('sets debug back to false', () => {
      const modified: SettingsState = { debug: true }
      const state = settingsReducer(modified, settingsActions.setDebug(false))
      expect(state.debug).toBe(false)
    })
  })

  describe('initialize', () => {
    it('replaces the whole slice', () => {
      const state = settingsReducer(defaultSettingsState, settingsActions.initialize({ debug: true }))
      expect(state).toEqual({ debug: true })
    })

    it('resets to defaults when given defaultSettingsState', () => {
      const modified: SettingsState = { debug: true }
      const state = settingsReducer(modified, settingsActions.initialize(defaultSettingsState))
      expect(state).toEqual(defaultSettingsState)
    })
  })

  describe('REHYDRATE', () => {
    it('backfills fields missing from an older persisted blob', () => {
      const state = settingsReducer(undefined, { type: 'persist/REHYDRATE', payload: { settings: {} } } as never)
      expect(state).toEqual(defaultSettingsState)
    })

    it('keeps the persisted values it does find', () => {
      const state = settingsReducer(undefined, { type: 'persist/REHYDRATE', payload: { settings: { debug: true } } } as never)
      expect(state.debug).toBe(true)
    })

    // redux-persist's default autoMergeLevel1 only hard-replaces a slice the reducer left untouched
    // on REHYDRATE, so returning a new object is what lets the backfill above survive.
    it('returns a new object, so redux-persist keeps the backfilled state', () => {
      const before = settingsReducer(undefined, { type: '@@INIT' })
      const after = settingsReducer(before, { type: 'persist/REHYDRATE', payload: { settings: {} } } as never)
      expect(after).not.toBe(before)
    })
  })

  describe('action creators', () => {
    it('setDebug creates action with correct type and payload', () => {
      const action = settingsActions.setDebug(true)
      expect(action.type).toBe('settings/setDebug')
      expect(action.payload).toBe(true)
    })

    it('initialize creates action with correct type and payload', () => {
      const action = settingsActions.initialize(defaultSettingsState)
      expect(action.type).toBe('settings/initialize')
      expect(action.payload).toEqual(defaultSettingsState)
    })
  })
})
