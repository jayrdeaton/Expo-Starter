# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

# Expo-Starter

A lean, production-ready Expo starter with file-based routing, Redux, theming, and a curated set of `@rific` packages pre-wired — depends on `@rific/auto-paper`, `@rific/core`, `@rific/drawer`, `@rific/feedback-press`, `@rific/focus-chain`, `@rific/resizable-input`, `@rific/scroll-view`, `@rific/splash-gate`, `@rific/toaster`, `@rific/updater`. **This is the actual template new apps in the fleet get bootstrapped from** (Pong's own CLAUDE.md documents being scaffolded directly from this repo's already-finished config shape) — until this pass, it was itself never on the shared tooling, meaning every app bootstrapped from it *before* this fix inherited the old hand-rolled config, not the shared one.

`@rific/core` is a required (non-optional) `peerDependency` of `auto-paper`, `drawer`, `feedback-press`, `resizable-input`, and `scroll-view` as of the September 2026 fleet-wide refactor that moved each package's hand-rolled settings-context/Redux-slice/module-config-singleton boilerplate onto `@rific/core`'s shared `createSettingsContext`/`createSettingsSlice`/`createModuleConfig` factories — hence it's a direct `dependencies` entry here too, not just transitive. It's a foundation package with no UI of its own (no `react-native-paper` or gesture dependency at all), so unlike the other nine it has no `demos/core.tsx`; the only thing this app imports from it directly is `safeBack`/`configureNavigation` (in `src/utils/navigation.ts`, see below) — the settings/Redux/module-config factories are consumed only internally by the other packages, and nothing here should import them unless a future screen wants to demo them. The migration was internal to each package (verified via `npm run verify` after the bump): public APIs, prop shapes, and Redux action-type strings were unchanged, so no code in this app needed to change to consume it. `@rific/core@0.2.x` (which `scroll-view@0.8.2` requires via `^0.2.0`) also fixed a real setState-during-render bug in `createSettingsContext`'s `onChange` and added a `REHYDRATE` backfill to `createSettingsSlice` so a newly added settings field isn't wiped by redux-persist's hard-replace on rehydrate — both apply to this app's persisted `theme`/`haptic`/`sound`/`scrollView` slices for free.

**This starter consumes the `@rific` helpers the way each package documents them — it's the source of truth other Expo apps copy from, so a package's own recommended wiring should show up here first, not lag behind it.** Concretely, as of the September 2026 pass: `Theme.tsx` builds `<Provider>`'s `initialValue`/`onChange`/`onReady` through `useThemeBridgeProps` (`@rific/auto-paper`); `Providers.tsx`'s `FeedbackBridge` builds `<FeedbackPressProvider>`'s five Redux/sound props through `useFeedbackBridgeProps` (`@rific/feedback-press`, with the `sound` config `useMemo`'d so the hook's own memoization actually holds); a small `UpdateChecker` component inside `ToastProvider` calls `useUpdater({ onError })` with `useUpdateErrorToast()` (`@rific/toaster`) so a failed update check surfaces as an error toast instead of `@rific/updater`'s default `Alert` — which is why `useUpdater()` no longer lives in `_layout.tsx` (the toast context doesn't exist above `Providers`); and every screen's back button goes through `safeBack` from `src/utils/navigation.ts` (a ~5-line module that calls `@rific/core`'s `configureNavigation({ router })` once at load and re-exports `safeBack`), so a demo screen reached by deep link/refresh with no back-stack falls back to `/` instead of expo-router's "GO_BACK was not handled by any navigator" error. `store.ts` mounts `@rific/feedback-press`'s own `soundReducer` directly — its `defaultSoundSettings` already defaults `enabled: !__DEV__` (muted in dev/simulator, on in production), so the old app-local `appSoundReducer` wrapper that existed to do that is gone; `store.test.ts` still asserts the real reducer's `!__DEV__` default, since that's the dev-mute guarantee worth guarding.

**Deliberately not adopted: `useGatedAudioPool` (`@rific/feedback-press/audio`).** It's for gameplay/ambient SFX triggered from game logic outside the button-press pipeline, so it respects the user's sound toggle without a manual `settings.enabled` check. This app has no such sound — the only direct-call sound sites are the feedback-press demo's sampler chips, which are an *audition* tool (`soundDisabled` chips, "tap a chip to audition it") and would go silent whenever the sound switch is off if gated. The provider-wide `sound` config (`useDefaultSounds`) is already gated internally by `FeedbackPressProvider`, so a gated pool there would gate twice. `DrawerEdgeSwipe`'s new `insetTop`/`insetBottom`/`insetLeft`/`insetRight` props also aren't demoed: they only exist on the standalone `DrawerEdgeSwipe`, and every drawer in the demo goes through `createDrawer()`, which doesn't forward them.

**Expo has changed.** Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code — don't rely on general Expo knowledge, this app is on SDK 57 specifically.

## Commands

```bash
npm run lint          # expo lint .
npm run fix            # expo lint . --fix
npm test               # Jest (11 suites, 48 tests)
npm run test:watch     # Jest --watchAll
npm run typecheck      # tsc
npm run verify         # lint + test + typecheck
npm run doctor          # expo install --fix && expo-doctor
npm start              # Expo dev server
npm run client          # Expo dev server (dev client build)
```

Always run `npm run lint` before finishing any task. This is an app (`"private": true`, no publish scripts) — `verify` doesn't include a build step.

**`build`/`update` are not local scripts — they route through `@rific/updater`'s `rific-updater-build`/`rific-updater-update` bins.** Run as `npm run build <profile>` / `npm run update <profile>` (`<profile>` is an `eas.json` build-profile name: `development`/`preview`/`production`). `development` builds locally (`expo prebuild --clean && eas build --profile development --local`, then relocates the artifact to `~/Downloads/Builds/`) and publishes OTA updates interactively; every other profile builds/publishes in the cloud, non-interactively. `verify` runs as each bin's own first step internally — there's no `npm run verify && ` prefix in the script definition itself to see, unlike the rest of the fleet's still-inline scripts. This app no longer has its own standalone `"prebuild": "expo prebuild --clean"` script — it was redundant once this package existed (nothing referenced it, and `rific-updater-build`'s own `--local` branch already runs `expo prebuild --clean` internally) and, left in place, it would have collided with a bare `"build"` name: npm auto-runs any script literally named `pre<name>` before `<name>`, so `"prebuild"` + `"build"` would have silently run a full local `expo prebuild --clean` before every single build, including cloud `preview`/`production` builds. Deleting the redundant `prebuild` script resolved that, rather than renaming this wrapper to dodge it. See [`../Expo-Updater/.claude/CLAUDE.md`](../Expo-Updater/.claude/CLAUDE.md)'s "Build script"/"Update script"/"Verify script" sections for the full mechanic — why it's not just inline `eas build`/`eas update`, the local-artifact relocation, the OTA-message-timing fix, profile validation against this app's own `eas.json`, why local-vs-cloud is derived from the profile name rather than an explicit flag, and the full `prebuild`-collision history (including why cloud builds were never actually at risk from stale local native state either way).

## Tooling

Onboarded onto the shared `@infinitetoken` config packages (`eslint-config`, `jest-config`, `tsconfig`) — was in a genuinely half-finished, stale state, not just untouched: `jest.config.ts` already called `require('@infinitetoken/jest-config/expo')`, but `package.json` pointed that dependency at a **local `.tgz` build file that no longer exists on disk** (`file:../Jest-Config/infinitetoken-jest-config-0.1.1.tgz`, left over from dogfooding before the package was ever really published) — meaning a fresh `npm install` in this repo was actually broken before this pass. `eslint.config.cjs` and `tsconfig.json` were still the full hand-rolled shape, never touched at all.

- `eslint.config.cjs` — `@infinitetoken/eslint-config/expo`, no local override (this app's old hand-rolled config was the same standard boilerplate every other pre-migration app had).
- `tsconfig.json` — `extends: "@infinitetoken/tsconfig/expo"`, keeps only the path-valued local bits (`paths`, `include`). No `@shopify/react-native-skia` — this app has no Skia dependency at all.
- `jest.config.cjs` — `@infinitetoken/jest-config/expo`, no options at all — `jest.setup.cjs` and `roots` are both auto-detected/defaulted, `moduleNameMapper` is auto-derived from `tsconfig.json`'s own `paths`.

`npx expo install --fix` + `npm update` were run as part of this pass — genuinely found staleness (`expo`, `expo-constants`, `expo-font`, `expo-updates`, several `@rific/*` packages were all a patch or minor behind); confirmed clean afterward: `npx expo install --check` reports up to date, `npm outdated` shows `Current === Wanted` for every dependency.

**`jest.config.ts` became `jest.config.cjs`, `tsconfig.json`'s `types` array was removed, and `prettier.config.js` was deleted** in favor of `"prettier": "@infinitetoken/eslint-config/prettier"` in `package.json` — same reasons documented in BoxHockey's/Swirlio's CLAUDE.md. This app never had a `metro.config.js`, like Swirlio/Snake.

**Native/Expo module mocks moved from inline `jest.mock()` calls in `jest.setup.cjs` into individual `src/__mocks__/*.ts` files** — `react-native-reanimated`, `react-native-worklets`, `@expo/vector-icons`, `expo-blur`, `expo-font`, `expo-linking`, `expo-splash-screen`, `react-native-gesture-handler`, `react-native-keyboard-controller`, `react-native-safe-area-context`, `redux-persist`, `redux-persist/integration/react`. Ported verbatim from this app's own pre-migration `jest.setup.ts` — content byte-identical to Snake's own extracted mocks, unsurprising since Snake was bootstrapped from this exact template. `jest.setup.cjs` now holds only genuine setup-file content. (Two more of the original mocks — `@react-native-async-storage/async-storage` and `expo-audio` — were later deleted once `@infinitetoken/jest-config@0.4.0`'s `expo` preset started covering them by default: `asyncStorageMock` maps async-storage to the package's own official in-memory Jest mock, and `knownSubpathMocks` stubs `@rific/feedback-press/audio` (`useAudioPool`/`useGatedAudioPool`) so the `expo-audio` layer underneath is never reached. Tests pass unchanged without them.)

**Migrating onto the shared eslint config surfaced 11 genuinely new `@typescript-eslint/no-explicit-any` errors**, all the identical pattern: `router.push(path as any)` in `src/app/(tabs)/index.tsx` and the `src/app/demos/*.tsx` demo screens. Confirmed (checked `app.json` for `experiments.typedRoutes` — not enabled) that expo-router's `Href` type already includes plain `string` when typed routes are off, so none of these casts were ever load-bearing — removed entirely rather than narrowed, same fix as HexFleet's identical finding.

**Migrating onto `@infinitetoken/tsconfig/expo` surfaced 6 dead `import React from 'react'` statements** across `src/__tests__/**` (leftover from before the `react-jsx` transform made them unnecessary) — removed, same pattern as every other app.

**One real bug was found in a *dependency's* source, not this app's own code — and it was already fixed upstream, just not yet installed here.** `node_modules/@rific/scroll-view/src/PullSearch.tsx` (pulled into the typecheck program via `customConditions: ["react-native"]` resolving to raw source, same mechanism as the `@shopify/react-native-skia` gotcha elsewhere in the fleet) had a `noImplicitReturns` violation in its debounce `useEffect` — but only surfaced because this app is the one place in the fleet that actually imports `PullSearch` (the `/demos/scroll-view` showcase screen). Checked `React-Native-Scroll-View`'s own source directly: the fix (`return undefined` on the non-debounce branch) was already committed there and is already published as `@rific/scroll-view@0.6.7` — this app's own `^0.6.5` range already covers it, `node_modules` was just stale. Resolved by the `npm update` in step 1, not a separate fix — nothing to change in this app's own code for this one.

`@infinitetoken/eslint-config` (`^0.2.0`), `@infinitetoken/jest-config` (`^0.4.0`), and `@infinitetoken/tsconfig` (`^0.5.0`) are all on real published versions now — the broken local `.tgz` reference is gone.

## Testing

- Framework: Jest (`@infinitetoken/jest-config/expo`, `jest-expo` preset)
- Tests live in `src/__tests__/`, mirroring the source subfolder structure
- Native/Expo module mocks live in `src/__mocks__/`, one file per module, picked up automatically (no `jest.mock()` call needed) — see Tooling above
- `jest.setup.cjs` holds only genuine setup-file concerns: process-level error handlers, RAF polyfills, the `IS_REACT_ACT_ENVIRONMENT` flag, the no-factory `NativeAnimatedHelper` automock

## Architecture

```
src/
  app/          - expo-router routes (tabs, demos/, packages/ — each demoing one @rific package)
  components/   - UI components (Providers, Theme)
  constants/    - static config
  hooks/        - custom hooks (incl. sounds/)
  redux/        - Redux Toolkit store + slices
  types/        - shared TypeScript types
  utils/        - splash gate, navigation (safeBack), and other helpers
  __tests__/    - test suites
  __mocks__/    - manual Jest mocks for native/Expo modules
```

## CI

`.github/workflows/ci.yml` already used the shared reusable workflow (`infinitetoken/Workflows/.github/workflows/npm-ci.yml@v1`) before this pass, just with a non-standard `run-name` (showed the PR title/commit message instead of the branch) — converged to the fleet-standard `run-name: CI — ${{ github.head_ref || github.ref_name }}` format for consistency, no functional change.
