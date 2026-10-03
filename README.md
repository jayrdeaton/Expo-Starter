# Expo Starter

A lean, production-ready Expo starter with file-based routing, Redux, theming, and a curated set of `@rific` packages pre-wired.

## Stack

| Layer | Package |
|---|---|
| Framework | Expo ~57 / React Native ~0.86 |
| Navigation | expo-router ~57 |
| State | Redux Toolkit + redux-persist |
| UI | react-native-paper ~5 |
| Gestures | react-native-gesture-handler ~2.32 |
| Animations | react-native-reanimated ~4.5 |
| OTA | expo-updates ~57 |
| Language | TypeScript ~6 |

---

## Included @rific Packages

### `@rific/core`

The shared foundation: `auto-paper`, `drawer`, `feedback-press`, `resizable-input`, and `scroll-view` all require it as a peer dependency. It has no UI of its own. It holds the `createSettingsContext`/`createSettingsSlice`/`createModuleConfig` factories those packages build their settings Providers, Redux slices, and optional-peer injection on (this app's own [`settingsSlice.ts`](src/redux/settingsSlice.ts) uses `createSettingsSlice` too, so a field added to it later is backfilled with its default on rehydrate instead of coming back `undefined`), plus `safeBack`, an expo-router back-navigation guard that falls back to `/` instead of throwing when there's no back-stack to pop (a screen opened by deep link or browser refresh). Configured once in [`navigation.ts`](src/utils/navigation.ts); every screen's back button goes through it. See [`demos/core.tsx`](src/app/demos/core.tsx) for an isolated, live instance of each factory.

```ts
// utils/navigation.ts
import { configureNavigation, safeBack } from '@rific/core';
import { router } from 'expo-router';

configureNavigation({ router });

export { safeBack };

// any screen
<ScrollViewHeader backAction={safeBack} title="Settings" />
```

---

### `@rific/auto-paper`

Adaptive `react-native-paper` theming. Derives a full triadic Material 3 palette from a single seed color and wires it to system / light / dark appearance automatically. Also carries fixed `success`/`warning`/`danger` semantic color roles (each with `on*`/`*Container` variants) alongside MD3's built-in `error`, and a typed `useAutoPaperTheme()` hook for reading them with full autocomplete. Bridged to Redux in [`Theme.tsx`](src/components/Theme.tsx) for persistence, with `useThemeBridgeProps` building the Provider's `initialValue`/`onChange`/`onReady` props. `expoBlur` injects `expo-blur`, so `BlurView` (and every `blur: true` surface built on it) renders real frosted glass; without it, it silently renders its solid fallback.

```ts
import { Provider, useAutoPaperTheme, useThemeBridgeProps } from '@rific/auto-paper';
import * as ExpoBlur from 'expo-blur';

// settings/onChange come from Redux, onReady marks the splash gate
const bridgeProps = useThemeBridgeProps({ initialValue: settings, onChange, onReady });

<Provider expoBlur={ExpoBlur} {...bridgeProps}>
  {children}
</Provider>

const { colors } = useAutoPaperTheme();
<Text style={{ color: colors.warning }}>Check your connection</Text>
```

---

### `@rific/drawer`

Sliding drawer/sheet, spring-animated and theme-aware. Slides in from any of the four edges: `left`/`right` for a nav/settings drawer, `top`/`bottom` for a sheet, same mechanism either way, so one package covers both use cases (this is what makes a standalone bottom-sheet dependency unnecessary in this stack). One `createDrawer()` call per instance; `combineDrawerProviders` flattens nesting multiple drawers into a single wrapper. See [`demos/drawer.tsx`](src/app/demos/drawer.tsx) for a left nav drawer, a right settings drawer, a bottom sheet, and an expandable sheet side by side.

```ts
import * as AutoPaper from '@rific/auto-paper';
import { combineDrawerProviders, createDrawer, DrawerProvider } from '@rific/drawer';

const nav = createDrawer({ side: 'left', width: 300 });
const sheet = createDrawer({ side: 'bottom', contentSize: true }); // sizes to its content instead of a fixed height
const settings = createDrawer({ side: 'right', width: 320, blur: true });

const AllDrawersProvider = combineDrawerProviders(
  [nav.DrawerInstanceProvider, { content: <NavDrawerContent /> }],
  [sheet.DrawerInstanceProvider, { content: <SheetContent /> }],
  [settings.DrawerInstanceProvider, { content: <SettingsDrawerContent /> }]
);

// once, near the app root: wires @rific/auto-paper's BlurView into every Drawer with blur: true
<DrawerProvider autoPaper={AutoPaper}>
  <AllDrawersProvider>{children}</AllDrawersProvider>
</DrawerProvider>

// anywhere else:
const { open } = sheet.useDrawer();
```

Each panel comes with a swipe-to-dismiss drag handle and an edge-swipe-to-open gesture built in. `blur: true` renders the panel surface via `@rific/auto-paper`'s `BlurView` instead of a solid fill — but only once `<DrawerProvider autoPaper={AutoPaper}>` is mounted above it; without it, `blur: true` silently falls back to solid. This app mounts it once in [`Providers.tsx`](src/components/Providers.tsx), above every Drawer (the toaster's history sheet opts out with `blur={false}`, since its content paints its own opaque surface).

---

### `@rific/scroll-view`

Blur-chrome scroll system. Drop-in replacements for `ScrollView`, `FlatList`, and `SectionList` with floating headers/footers, pull-to-search, keyboard awareness, and horizontal paging. Bridged to Redux in [`Providers.tsx`](src/components/Providers.tsx).

```ts
import { FlatList, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view';

<ScrollViewProvider>
  <ScrollViewHeader title="My Screen" />
  <FlatList data={items} renderItem={renderItem} keyExtractor={keyExtractor} />
</ScrollViewProvider>
```

---

### `@rific/feedback-press`

Haptic and sound feedback wrappers for `react-native-paper` and built-in pressable components. Drop-in replacements that fire a `selection` haptic (and, optionally, a sound) on touch-down and `notification` feedback on long press, covering `Button`, `IconButton`, `TouchableRipple`, `Card`, `Chip`, `AppbarBackAction`, `AppbarAction`, `FAB`, `Checkbox`, `Switch`, `SegmentedButtons`, plus the native `Pressable`/`TouchableOpacity`/`TouchableHighlight`. Bridged to Redux in [`Providers.tsx`](src/components/Providers.tsx)'s `FeedbackBridge`, so both the haptics and sound toggles persist; the app-wide sound config is [`useProviderSounds()`](src/hooks/sounds/useDefaultSounds.ts) (a click for `selection`, a pop for `notification`). Sound defaults to off in dev builds and on in production. `paper={RNPaper}` makes the wrappers render as real Paper components; omit it and they render a plain-RN fallback. See [`demos/feedback-press.tsx`](src/app/demos/feedback-press.tsx) for the Paper wrappers in action plus a sound sampler.

```tsx
import { Button, FeedbackPressProvider, useFeedbackBridgeProps } from '@rific/feedback-press';
import * as RNPaper from 'react-native-paper';

// once, near the app root
const bridgeProps = useFeedbackBridgeProps({ initialValue: haptic, onChange, soundInitialValue: sound, onSoundChange, sound: soundConfig });

<FeedbackPressProvider paper={RNPaper} {...bridgeProps}>
  {children}
</FeedbackPressProvider>

// anywhere else, same props as Paper's own Button
<Button mode="contained" onPress={handlePress}>Submit</Button>
```

---

### `@rific/toaster`

Stacking, animated toast notifications with a history stack and swipe-to-dismiss. Includes a provider and a `useToast` hook. `haptics` and `paper` are optional injections: a light haptic tick on the stack controls, and Paper components instead of the plain-RN fallback UI. This app also swaps the history view's default Modal for a `@rific/drawer` bottom sheet (`HistoryDrawerContainer` in [`Providers.tsx`](src/components/Providers.tsx)), and renders a `Portal.Host` just inside `ToastProvider` so dialogs and menus (which render through a portal) can call `useToast()` too.

```ts
import { Toaster, ToastProvider, useToast } from '@rific/toaster';
import * as Haptics from 'expo-haptics';
import * as RNPaper from 'react-native-paper';

// Wrap your app
<ToastProvider haptics={Haptics} paper={RNPaper}>
  {children}
  <Toaster />
</ToastProvider>

// Trigger anywhere
const { success } = useToast();
success('Saved!');
```

---

### `@rific/updater`

OTA update hook for Expo apps. Checks for updates on launch and on every foreground resume, prompting to restart as soon as one's found — pass `autoPrompt: false` to stage them silently instead. Also exposes a manual `check()`, plus `onConfirm`/`onInfo`/`onError` callbacks to replace the default `Alert.alert` dialogs. This app calls it from a small `UpdateChecker` inside `ToastProvider` in [`Providers.tsx`](src/components/Providers.tsx), so `onError` (in practice a failed confirm/reload during the auto-prompt, since `UpdateChecker` never calls `check()`) shows an error toast instead of an `Alert`. Failed background checks stay silent.

```tsx
import { useUpdateErrorToast } from '@rific/toaster';
import { useUpdater } from '@rific/updater';

// background polling is automatic; rendered inside ToastProvider, since useUpdateErrorToast needs its context
const UpdateChecker = () => {
  const onError = useUpdateErrorToast();
  useUpdater({ onError });
  return null;
};

<ToastProvider>
  <UpdateChecker />
  {children}
</ToastProvider>
```

---

### `@rific/focus-chain`

Auto-advancing focus chain for form inputs. Call the hook once, then `register()` once per input in order: it returns `{ ref, props }`, so pass `ref` to the input's `ref` and spread `props` onto it, and pressing Next or Return moves focus to the next field automatically, with no index or ref bookkeeping.

```ts
import { useFocusChain } from '@rific/focus-chain';

const register = useFocusChain();
const first = register();
const second = register();

<TextInput ref={first.ref} {...first.props} returnKeyType="next" />
<TextInput ref={second.ref} {...second.props} returnKeyType="done" onSubmitEditing={handleSubmit} />
```

---

### `@rific/resizable-input`

Auto-growing, drag-resizable multiline text input. Grows with its content as the user types, and a drag handle lets them resize it manually between `minHeight` and `maxHeight`. Renders React Native's own `TextInput` by default; pass `TextInputComponent` per instance, or mount `ResizableInputProvider` once, to swap in `react-native-paper`'s instead. See [`demos/resizable-input.tsx`](src/app/demos/resizable-input.tsx), which mounts the provider around its own screen (harmless here, since no other screen uses `ResizableInput`; the setting it applies is app-wide either way).

```tsx
import { ResizableInput, ResizableInputProvider } from '@rific/resizable-input';
import { TextInput as PaperTextInput } from 'react-native-paper';

// once, near the app root: sets the app-wide default (module-level config, not context), so every ResizableInput uses Paper's TextInput
<ResizableInputProvider TextInputComponent={PaperTextInput}>
  {children}
</ResizableInputProvider>

const [notes, setNotes] = useState<string | null>(null); // onChangeText reports null when empty
<ResizableInput value={notes} onChangeText={setNotes} minHeight={80} maxHeight={300} />
```

---

### `@rific/splash-gate`

Names every async condition this app's first screen depends on and holds the splash screen up until all of them report ready, instead of hiding it the moment the first one resolves and letting anything else (an icon font, a hydrated preference) pop in a beat later. Wired into [`Theme.tsx`](src/components/Theme.tsx): `theme` (auto-paper's own Provider `onReady`) and `fonts` (the icon font every react-native-paper icon in this app depends on, preloaded via `expo-font`'s `useFonts`). See [`demos/splash-gate.tsx`](src/app/demos/splash-gate.tsx) for an isolated, replayable simulation of the mechanism, plus a live comparison demoing the `Gate` component below. The real splash screen can only ever show once, at cold launch, so it can't be demoed directly from a screen you navigate to.

```ts
import { createGate } from '@rific/splash-gate';

// utils/splashGate.ts, created once, at module scope
export const { markReady: markSplashReady, useReady: useSplashReady, pendingGates: pendingSplashGates, Gate: SplashGate } = createGate(['theme', 'fonts'] as const);

// Theme.tsx
const [fontsLoaded, fontError] = useFonts(MaterialCommunityIcons.font);
useSplashReady('fonts', fontsLoaded || fontError != null); // a failed load still lifts the splash
const onReady = useCallback(() => markSplashReady('theme'), []); // a one-shot callback, not a boolean, call directly
```

`Gate` (exported here as `SplashGate`, not used yet) is `useReady` plus render-gating in one step: it withholds `children` until `ready` is `true`, instead of just marking the gate. Reach for it over `useReady` when what you're mounting is a component whose own state locks in on first render (a lazy `useState(() => initialProp)` initializer, the same pattern most context providers use) — marking the gate ready doesn't help if the child already locked onto a stale placeholder before that:

```tsx
// keyboardLayout: null while loading from storage, the real value once it resolves
<Gate gate="keyboardLayout" ready={layout !== null}>
  <ThirdPartyLayoutProvider initialLayout={layout}>{children}</ThirdPartyLayoutProvider>
</Gate>
```

---

## Optional @rific Packages

These are not included by default but are built to work seamlessly with this stack. Each has an info screen under [`src/app/packages/`](src/app/packages) with its install command and usage.

| Package | Description |
|---|---|
| `@rific/heatmap` | GitHub-style activity heatmap with SVG rendering and customizable cell modes |
| `@rific/scanner` | Full-screen barcode scanner with animated overlays, pinch zoom, timeout ring, and scan tracking |
| `@rific/timer` | Animated SVG progress ring timer |

---

## Getting Started

`expo-dev-client` is installed, so the dev server opens a development build of this app, not Expo Go. Build and install one first, and again after any native change:

```bash
npm install
npm run ios          # expo run:ios: build + install a development build on the iOS simulator, then start the dev server
npm run ios:device   # same, on a connected physical iOS device
npm run android      # same, on an Android emulator
```

`ios/` and `android/` are gitignored, generated from [app.json](app.json): `npm run ios`/`npm run android` only generate them when they're missing, so after changing app.json's native config or adding a native module, regenerate them with `npx expo prebuild --clean` first.

After that, day to day:

```bash
npm start            # dev server; opens the installed development build
npm run client       # same, with --dev-client passed explicitly
npm run reset        # same as start, with a cleared Metro cache
```

### Validation

```bash
npm run verify       # lint + test + typecheck
npm run lint
npm run fix          # lint with --fix
npm test
npm run typecheck
npm run doctor       # expo install --fix + expo-doctor
```

### EAS

`build` and `update` take an [eas.json](eas.json) build profile (`development`, `preview`, or `production`) and run `npm run verify` first:

```bash
npm run build development   # local build (expo prebuild --clean + eas build --local), artifact moved to ~/Downloads/Builds/
npm run build preview       # cloud build
npm run build production    # cloud build
npm run update <profile>    # publish an OTA update to that profile's branch
npm run submit              # eas submit
```

`npm run update <profile>` needs a clean git working tree: it bumps `otaVersion` in [`release.ts`](src/constants/release.ts), commits that bump on its own (`otaVersion N -> N+1`), then runs `eas update` with your last commit's message. `development` publishes interactively; every other profile publishes non-interactively.

---

## Project Structure

```
src/
  app/            # expo-router file-based routes (+not-found.tsx for unmatched URLs)
    demos/        # example screens for each included @rific package
    packages/     # example screens for each optional @rific package
  components/     # shared UI components (Providers, Theme)
  constants/      # app-wide constants (incl. release.ts's otaVersion)
  hooks/          # custom hooks, incl. sounds/ packs for @rific/feedback-press
  redux/          # store, slices, persistor
  types/          # shared TypeScript types
  utils/          # splash gate, navigation (safeBack), and other helpers
  __tests__/      # Jest test suite
  __mocks__/      # Jest mocks for native/Expo modules, picked up automatically
```

---

## Configuration

- **App identity**: `name`, `slug`, and `scheme` in [app.json](app.json). `scheme` is the deep-link scheme: make it unique per app (e.g. derived from the slug), since the starter's generic `app` collides with any other app claiming it
- **Bundle identifiers**: `ios.bundleIdentifier` and `android.package` in [app.json](app.json)
- **EAS project**: `extra.eas.projectId` and `updates.url` (`https://u.expo.dev/<projectId>`) in [app.json](app.json) both point at this starter's EAS project. Delete both, then run `eas init` (creates or links your own project and writes `extra.eas.projectId`) and `eas update:configure` (writes the matching `updates.url`)
- **Theme seed color**: defaults to `#6750a4`; override by swapping `themeReducer` for `createThemeReducer({ color: '...' })` from `@rific/auto-paper` in [redux/store.ts](src/redux/store.ts)
