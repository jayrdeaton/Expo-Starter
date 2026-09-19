import { configureNavigation, safeBack } from '@rific/core'
import { router } from 'expo-router'

configureNavigation({ router })

export { safeBack }
