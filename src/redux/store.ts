import AsyncStorage from '@react-native-async-storage/async-storage'
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { themeReducer } from '@rific/auto-paper'
import { hapticReducer, soundReducer } from '@rific/feedback-press'
import { scrollViewReducer } from '@rific/scroll-view'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'

import settings from './settingsSlice'

export const rootReducer = combineReducers({
  theme: themeReducer,
  scrollView: scrollViewReducer,
  haptic: hapticReducer,
  sound: soundReducer,
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
