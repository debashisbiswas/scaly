import { DEFAULT_SINGLE_BPM, getClefRangeConfig } from "./constants"
import {
  Clef,
  KeySignature,
  PitchLabel,
  ScaleMode,
  TempoSetting,
} from "./types"

const DEFAULT_RANGE_CONFIG = getClefRangeConfig(null)
const DEFAULT_LOW_PITCH = DEFAULT_RANGE_CONFIG.defaultLow
const DEFAULT_HIGH_PITCH = DEFAULT_RANGE_CONFIG.defaultHigh

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

export namespace FlowDraft {
  export type Shape = {
    keys: KeySignature[]
    clef: Clef | null
    range: {
      low: PitchLabel
      high: PitchLabel
    }
    modes: ScaleMode[]
    tempo: TempoSetting
  }

  export function createEmpty(): Shape {
    return {
      keys: [],
      clef: null,
      range: {
        low: DEFAULT_LOW_PITCH,
        high: DEFAULT_HIGH_PITCH,
      },
      modes: [],
      tempo: { kind: "single", bpm: DEFAULT_SINGLE_BPM },
    }
  }

  export function normalize(draft: Shape): Shape {
    return {
      ...draft,
      keys: Array.from(new Set(draft.keys)),
      modes: Array.from(new Set(draft.modes)),
    }
  }
}
