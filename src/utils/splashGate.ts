import { createGate } from '@rific/splash-gate'

// Every async condition the very first screen depends on, named once here so nothing can be
// forgotten silently. See Theme.tsx for where each one actually reports in. Add a new gate here,
// and mark it ready from wherever it resolves, any time a future screen picks up a new async
// dependency of its own (a hydrated preference, an auth check, ...).
//
// SplashGate (the Gate component) is exported alongside markSplashReady/useSplashReady/
// pendingSplashGates for the day a future provider needs it: something that mounts a
// third-party component whose internal state locks in on first render (a lazy useState(() =>
// initialProp) initializer) must not render until its real value exists, or the gate reporting
// ready doesn't help - see the demo at src/app/demos/splash-gate.tsx for why. None of this app's
// current providers have that shape (PersistGate already blocks every child below it until
// Redux's persisted state has rehydrated, so `settings` is already correct the first time
// Theme.tsx renders), so nothing here uses it yet.
export const { markReady: markSplashReady, useReady: useSplashReady, pendingGates: pendingSplashGates, Gate: SplashGate } = createGate(['theme', 'fonts'] as const)
