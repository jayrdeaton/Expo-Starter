import { useAudioPool } from '@rific/feedback-press/audio'

// Relative, not the @/ alias — static require() calls Metro's asset plugin has to resolve at
// bundle time, same convention as every other local-asset require in this codebase.
const CLICK_SOUND = require('../../../assets/sounds/click.wav')
const POP_SOUND = require('../../../assets/sounds/pop.wav')
const CHIME_SOUND = require('../../../assets/sounds/chime.wav')
const BUZZ_SOUND = require('../../../assets/sounds/buzz.wav')

// The app-wide provider default (see Providers.tsx's FeedbackBridge): just the two clips
// FeedbackPressProvider's sound config has a slot for (selection/notification), kept apart from
// the full sampler (useDefaultSounds below, aggregated by useFeedbackSounds.ts) so the app-wide
// provider only pays for those two clips' pooled players instead of both packs' worth.
export const useProviderSounds = () => {
  const playClick = useAudioPool(CLICK_SOUND)
  const playPop = useAudioPool(POP_SOUND)

  return { playClick, playPop }
}

export const useDefaultSounds = () => {
  const { playClick, playPop } = useProviderSounds()
  const playChime = useAudioPool(CHIME_SOUND)
  const playBuzz = useAudioPool(BUZZ_SOUND)

  return { playClick, playPop, playChime, playBuzz }
}
