// Not strictly required (jest-expo already stubs expo-font's native loader, so the real module works),
// but keeps useFonts deterministic: the real hook resolves through loadAsync() in an effect, while
// this returns [true, null] synchronously, so Theme.tsx's useFonts(MaterialCommunityIcons.font)
// marks the 'fonts' splash condition on first render. This replaces the whole module, so
// isLoaded/loadAsync stay too: @expo/vector-icons/MaterialCommunityIcons calls them whenever an icon renders.
module.exports = {
  isLoaded: () => true,
  loadAsync: () => Promise.resolve(),
  useFonts: () => [true, null]
}
