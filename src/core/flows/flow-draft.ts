import {
  DEFAULT_SINGLE_BPM,
  MIN_BPM,
  MAX_BPM,
  getClefRangeConfig,
} from "./constants"
import { Pitch } from "./pitch"
import { ExerciseSelection } from "./exerciseCatalog"
import { Clef, KeySignature } from "./types"
import { TempoSetting } from "./tempo-setting"
import { CachedRange } from "./cached-range"

function pitchLabelToMidi(label: string) {
  const parsed = Pitch.fromLabel(label)

  if (!parsed) {
    return null
  }

  return Pitch.midi(parsed)
}

// TODO: This module is having an identity crisis in competition with
// FlowStoreProvider. Commit to one or the other.
export namespace FlowDraft {
  // TODO: The low/high values should really be of type Pitch. Look into
  // downstream consumers to see the implications of keeping this "stringly
  // typed"
  type Range = {
    low: string
    high: string
  }

  export type Shape = {
    keys: KeySignature[]
    clef: Clef | null
    range: Range
    modes: ExerciseSelection[]
    tempo: TempoSetting.Shape
  }

  export type ValidationError =
    | "missing_keys"
    | "missing_clef"
    | "missing_modes"
    | "invalid_range"
    | "invalid_tempo"

  export const getInitialRange = (clef: Clef): Range => {
    const cached = CachedRange.get(clef)
    if (cached) return cached

    const clefRangeConfig = getClefRangeConfig(clef)

    return {
      low: clefRangeConfig.defaultLow,
      high: clefRangeConfig.defaultHigh,
    }
  }

  export function createEmpty(): Shape {
    // TODO: Don't use a null clef to get a default for the range - just allow
    // null for the range when the draft is created. Lots of downstream callers
    // depend on the range type currently, so need to decouple that first.
    const clef = null
    const clefRangeConfig = getClefRangeConfig(clef)

    return {
      keys: [],
      clef,
      range: {
        low: clefRangeConfig.defaultLow,
        high: clefRangeConfig.defaultHigh,
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
    clef: Clef | null,
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
