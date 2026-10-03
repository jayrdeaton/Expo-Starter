import { useClassicSounds } from './sounds/useClassicSounds'
import { useDefaultSounds } from './sounds/useDefaultSounds'

// Aggregates both sound packs (./sounds/use*Sounds.ts) into one flat object, for the
// feedback-press demo's full sampler. Each pack is its own self-contained hook + asset files, so
// lifting just the one you like into another app means copying that one file (plus its
// assets/sounds files) rather than this whole tree. The full 10-pack library this started from
// (Warm/Minimal/Lofi/Retro/Experimental/Mechanical/Glitch/Nature, in addition to these two) lives
// at ~/Developer/Sounds for any app that wants more than this starter's two examples.
// Providers.tsx calls useProviderSounds() (./sounds/useDefaultSounds.ts) directly instead of this
// aggregator, so the app-wide provider default isn't paying for both packs' worth of pooled players
// just to use two clips.
export const useFeedbackSounds = () => {
  const defaultSounds = useDefaultSounds()
  const classicSounds = useClassicSounds()

  return {
    ...defaultSounds,
    ...classicSounds
  }
}
