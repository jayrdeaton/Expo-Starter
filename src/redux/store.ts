import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore, type Reducer } from '@reduxjs/toolkit'
import { themeReducer } from '@rific/auto-paper'
import { defaultSoundSettings, hapticReducer, soundReducer, type SoundSettings } from '@rific/feedback-press'
import { scrollViewReducer } from '@rific/scroll-view'
import { Platform } from 'react-native'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import settings from './settingsSlice'

// Sound starts off on web, so a visitor to the demo site doesn't hear clicks before turning it on.
// Native keeps the package's own default (off in dev, on in production). Only the starting state
// differs: every action still goes through the package's reducer.
const initialSound: SoundSettings = { ...defaultSoundSettings, enabled: defaultSoundSettings.enabled && Platform.OS !== 'web' }
const sound: Reducer<SoundSettings> = (state = initialSound, action) => soundReducer(state, action)

export const rootReducer = combineReducers({
  theme: themeReducer,
  scrollView: scrollViewReducer,
  haptic: hapticReducer,
  sound,
  settings
})

export const persistConfig = {
  key: 'root',
  storage: AsyncStorage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }),
  reducer: persistedReducer
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
