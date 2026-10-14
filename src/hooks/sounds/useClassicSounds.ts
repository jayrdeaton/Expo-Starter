import { useAudioPool } from '@rific/feedback-press/audio'

// Relative, not the @/ alias - see useDefaultSounds.ts's own comment on why static asset
// requires in this codebase stick to plain relative paths.
const CLASSIC_CLICK_SOUND = require('../../../assets/sounds/classic-click.wav')
const CLASSIC_POP_SOUND = require('../../../assets/sounds/classic-pop.mp3')
const CLASSIC_CHIME_SOUND = require('../../../assets/sounds/classic-chime.wav')
const CLASSIC_BUZZ_SOUND = require('../../../assets/sounds/classic-buzz.wav')

// The original set, kept around as a demo-able override rather than deleted outright - see the
// Sound section of the feedback-press demo screen, which lets you A/B both sets.
export const useClassicSounds = () => {
  const playClassicClick = useAudioPool(CLASSIC_CLICK_SOUND)
  const playClassicPop = useAudioPool(CLASSIC_POP_SOUND)
  const playClassicChime = useAudioPool(CLASSIC_CHIME_SOUND)
  const playClassicBuzz = useAudioPool(CLASSIC_BUZZ_SOUND)

  return { playClassicClick, playClassicPop, playClassicChime, playClassicBuzz }
}
