import { createSettingsSlice } from '@rific/core'

export type SettingsState = {
  debug: boolean
}

export const defaultSettingsState: SettingsState = {
  debug: false
}

// Built the same way as the @rific slices mounted next to it in store.ts: a setX action per field
// (settings/setDebug), initialize(state) to replace the whole slice (initialize(defaultSettingsState)
// to reset), and a REHYDRATE backfill so a field added here later comes back as its default, not
// undefined, for a blob persisted before it existed. That backfill reads the persisted payload's
// `settings` key, so the slice has to stay mounted under `settings` in store.ts.
const slice = createSettingsSlice<SettingsState>('settings', { initialState: defaultSettingsState })

export const settingsActions = slice.actions
export default slice.reducer
