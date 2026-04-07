import {
  KEY_SIGNATURE_OPTIONS,
  DEFAULT_SINGLE_BPM,
  MAX_BPM,
  MIN_BPM,
  MODE_OPTIONS,
  getClefRangeConfig,
} from "./constants"
import {
  CreateFlowResult,
  Flow,
  FlowDraft,
  FlowDraftValidationError,
} from "./types"

const DEFAULT_RANGE_CONFIG = getClefRangeConfig(null)
const DEFAULT_LOW_PITCH = DEFAULT_RANGE_CONFIG.defaultLow
const DEFAULT_HIGH_PITCH = DEFAULT_RANGE_CONFIG.defaultHigh
const NATURAL_NOTE_OFFSET: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

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
  tempo: FlowDraft["tempo"]
}

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function createFlowId(now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `flow_${now.getTime()}_${randomSuffix}`
}

function parsePitchLabel(label: string) {
  const match = label.match(/^([A-G])([#b]?)(\d+)$/)

  if (!match) {
    return null
  }

  return {
    noteName: match[1],
    accidental: match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0,
    octave: Number(match[3]),
  }
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

function pitchLabelToMidi(label: string) {
  const parsed = parsePitchLabel(label)

  if (!parsed) {
    return null
  }

  const naturalOffset = NATURAL_NOTE_OFFSET[parsed.noteName]

  if (naturalOffset === undefined) {
    return null
  }

  return (parsed.octave + 1) * 12 + naturalOffset + parsed.accidental
}

function isRangeWithinSelectedClef(
  clef: FlowDraft["clef"],
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

export function createEmptyFlowDraft(): FlowDraft {
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

export function normalizeFlowDraft(draft: FlowDraft): FlowDraft {
  return {
    ...draft,
    keys: unique(draft.keys),
    modes: unique(draft.modes),
  }
}

export function expandFlowDraftToExerciseSpecs(
  inputDraft: FlowDraft,
): GeneratedExerciseSpec[] {
  const errors = validateFlowDraft(inputDraft)

  if (errors.length > 0) {
    throw new Error("Cannot expand invalid flow draft.")
  }

  const draft = normalizeFlowDraft(inputDraft)
  const lowPitch = parsePitchLabel(draft.range.low)
  const highPitch = parsePitchLabel(draft.range.high)

  if (!lowPitch || !highPitch) {
    throw new Error("Cannot expand flow draft with invalid range labels.")
  }

  if (draft.clef === null) {
    throw new Error("Cannot expand flow draft without a clef.")
  }

  const canonicalKeys = sortByOrder(draft.keys, KEY_SIGNATURE_OPTIONS)
  const canonicalModes = sortByOrder(draft.modes, MODE_OPTIONS)

  const startOctave = lowPitch.octave
  const octaves = Math.max(
    1,
    Math.min(3, highPitch.octave - lowPitch.octave + 1),
  )
  const clef: GeneratedExerciseSpec["clef"] =
    draft.clef === "Bass Clef" ? "bass" : "treble"

  const exerciseSpecs: GeneratedExerciseSpec[] = []

  for (const key of canonicalKeys) {
    const exerciseKey = key === "F#/Gb" ? "F#" : key

    for (const mode of canonicalModes) {
      const mappedMode = SCALE_MODE_MAP[mode]

      exerciseSpecs.push({
        key: exerciseKey,
        mode: mappedMode,
        startOctave,
        octaves,
        clef,
        tempo: draft.tempo,
      })
    }
  }

  return exerciseSpecs
}

export function validateFlowDraft(
  inputDraft: FlowDraft,
): FlowDraftValidationError[] {
  const draft = normalizeFlowDraft(inputDraft)
  const errors: FlowDraftValidationError[] = []

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

export function createFlowFromDraft({
  draft: inputDraft,
  name,
  now = new Date(),
}: {
  draft: FlowDraft
  name: string
  now?: Date
}): CreateFlowResult {
  const normalizedName = name.trim()
  const errors = validateFlowDraft(inputDraft)

  if (normalizedName.length === 0) {
    return {
      ok: false,
      errors,
    }
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors,
    }
  }

  const draft = normalizeFlowDraft(inputDraft)
  const nowIso = now.toISOString()

  const flow: Flow = {
    id: createFlowId(now),
    name: normalizedName,
    config: draft,
    progressPercent: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  }

  return {
    ok: true,
    value: flow,
  }
}

export function getFlowCreationErrorMessage(
  errors: FlowDraftValidationError[],
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
