import { KEY_SIGNATURE_OPTIONS, MODE_OPTIONS } from "./constants"
import { FlowDraft } from "./flow-draft"
import { Note } from "./note"
import { Pitch } from "./pitch"
import { TempoSetting } from "./tempo-setting"

const SCALE_MODE_MAP = {
  Major: "major",
  "Natural Minor": "minor",
  "Harmonic Minor": "harmonic minor",
  "Melodic Minor": "melodic minor",
} as const

export type GeneratedExerciseSpec = {
  key: string
  mode: (typeof SCALE_MODE_MAP)[keyof typeof SCALE_MODE_MAP]
  startOctave: number
  octaves: number
  clef: "treble" | "bass"
  tempo: FlowDraft.Shape["tempo"]
}

function sortByOrder<T extends string>(values: T[], order: readonly T[]) {
  const indexMap = new Map(order.map((value, index) => [value, index]))

  return [...values].sort((a, b) => {
    const aIndex = indexMap.get(a)
    const bIndex = indexMap.get(b)

    if (aIndex === undefined && bIndex === undefined) {
      return a.localeCompare(b)
    }

    if (aIndex === undefined) {
      return 1
    }

    if (bIndex === undefined) {
      return -1
    }

    return aIndex - bIndex
  })
}

export function expandFlowDraftToExerciseSpecs(
  inputDraft: FlowDraft.Shape,
): GeneratedExerciseSpec[] {
  const errors = FlowDraft.validate(inputDraft)

  if (errors.length > 0) {
    throw new Error("Cannot expand invalid flow draft.")
  }

  const draft = FlowDraft.normalize(inputDraft)
  const lowPitch = Pitch.fromLabel(draft.range.low)
  const highPitch = Pitch.fromLabel(draft.range.high)

  if (!lowPitch || !highPitch) {
    throw new Error("Cannot expand flow draft with invalid range labels.")
  }

  if (draft.clef === null) {
    throw new Error("Cannot expand flow draft without a clef.")
  }

  const canonicalKeys = sortByOrder(draft.keys, KEY_SIGNATURE_OPTIONS)
  const canonicalModes = sortByOrder(draft.modes, MODE_OPTIONS)

  const clef: GeneratedExerciseSpec["clef"] =
    draft.clef === "Bass Clef" ? "bass" : "treble"
  const tempoBuckets = TempoSetting.expand(draft.tempo)

  const exerciseSpecs: GeneratedExerciseSpec[] = []

  for (const key of canonicalKeys) {
    for (const mode of canonicalModes) {
      const tonicNote = Note.fromKeySignature(key)

      if (!tonicNote) {
        throw new Error(
          `Cannot expand flow draft with invalid key signature: ${key}`,
        )
      }

      const tonicPitch = Pitch.nextAvailablePitch(lowPitch, tonicNote)
      const octaves = Pitch.availableOctaves(tonicPitch, highPitch)

      // TODO: Can we prevent this case earlier?
      if (octaves <= 0) {
        console.log(
          "WARNING: no octaves available: ",
          JSON.stringify({
            range: {
              lowPitch,
              highPitch,
            },
            tonicPitch,
          }),
        )
        continue
      }

      for (const tempo of tempoBuckets) {
        exerciseSpecs.push({
          key: Note.fullName(tonicNote),
          mode: SCALE_MODE_MAP[mode],
          startOctave: tonicPitch.octave,
          octaves,
          clef,
          tempo,
        })
      }
    }
  }

  return exerciseSpecs
}

export function getFlowCreationErrorMessage(
  errors: FlowDraft.ValidationError[],
  name: string,
) {
  if (name.trim().length === 0) {
    return "Please enter a name for this flow."
  }

  if (errors.includes("missing_keys")) {
    return "Pick at least one key."
  }

  if (errors.includes("missing_clef")) {
    return "Pick a clef."
  }

  if (errors.includes("missing_modes")) {
    return "Pick at least one mode."
  }

  if (errors.includes("invalid_range")) {
    return "Choose a valid range."
  }

  if (errors.includes("invalid_tempo")) {
    return "Choose a valid tempo."
  }

  return "Unable to create flow."
}
