import {
  DEFAULT_SINGLE_BPM,
  MIN_BPM,
  MAX_BPM,
  getClefRangeConfig,
} from "./constants"
import { Pitch } from "./Pitch"
import { Clef, KeySignature, ScaleMode, TempoSetting } from "./types"

const DEFAULT_RANGE_CONFIG = getClefRangeConfig(null)
const DEFAULT_LOW_PITCH = DEFAULT_RANGE_CONFIG.defaultLow
const DEFAULT_HIGH_PITCH = DEFAULT_RANGE_CONFIG.defaultHigh

function pitchLabelToMidi(label: string) {
  const parsed = Pitch.fromLabel(label)

  if (!parsed) {
    return null
  }

  return Pitch.midi(parsed)
}

export namespace FlowDraft {
  export type Shape = {
    keys: KeySignature[]
    clef: Clef | null
    range: {
      low: string
      high: string
    }
    modes: ScaleMode[]
    tempo: TempoSetting
  }

  export type ValidationError =
    | "missing_keys"
    | "missing_clef"
    | "missing_modes"
    | "invalid_range"
    | "invalid_tempo"

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

  export function validate(input: Shape): ValidationError[] {
    const draft = normalize(input)
    const errors: ValidationError[] = []

    if (draft.keys.length === 0) {
      errors.push("missing_keys")
    }

    if (draft.clef === null) {
      errors.push("missing_clef")
    }

    if (draft.modes.length === 0) {
      errors.push("missing_modes")
    }

    const lowMidi = pitchLabelToMidi(draft.range.low)
    const highMidi = pitchLabelToMidi(draft.range.high)

    if (
      lowMidi === null ||
      highMidi === null ||
      lowMidi > highMidi ||
      !isRangeWithinSelectedClef(draft.clef, lowMidi, highMidi)
    ) {
      errors.push("invalid_range")
    }

    if (draft.tempo.kind === "single") {
      if (draft.tempo.bpm < MIN_BPM || draft.tempo.bpm > MAX_BPM) {
        errors.push("invalid_tempo")
      }
    } else {
      const { minBpm, maxBpm } = draft.tempo
      if (
        minBpm < MIN_BPM ||
        minBpm > MAX_BPM ||
        maxBpm < MIN_BPM ||
        maxBpm > MAX_BPM ||
        minBpm > maxBpm
      ) {
        errors.push("invalid_tempo")
      }
    }

    return errors
  }

  function isRangeWithinSelectedClef(
    clef: Shape["clef"],
    lowMidi: number,
    highMidi: number,
  ) {
    if (clef === null) {
      return true
    }

    const rangeConfig = getClefRangeConfig(clef)
    const minMidi = pitchLabelToMidi(rangeConfig.minPitch)
    const maxMidi = pitchLabelToMidi(rangeConfig.maxPitch)

    if (minMidi === null || maxMidi === null) {
      return true
    }

    return lowMidi >= minMidi && highMidi <= maxMidi
  }
}
