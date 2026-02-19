import {
  DEFAULT_SINGLE_BPM,
  MAX_BPM,
  MIN_BPM,
  NOTE_STEP_OPTIONS,
} from "./constants"
import {
  CreateFlowResult,
  Flow,
  FlowDraft,
  FlowDraftValidationError,
} from "./types"

const DEFAULT_LOW_PITCH = NOTE_STEP_OPTIONS[4].label
const DEFAULT_HIGH_PITCH = NOTE_STEP_OPTIONS[16].label

function unique<T extends string>(values: T[]) {
  return [...new Set(values)]
}

function createFlowId(now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `flow_${now.getTime()}_${randomSuffix}`
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
    slurPatternIds: [],
  }
}

export function normalizeFlowDraft(draft: FlowDraft): FlowDraft {
  return {
    ...draft,
    keys: unique(draft.keys),
    modes: unique(draft.modes),
    slurPatternIds: unique(draft.slurPatternIds),
  }
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

  if (draft.slurPatternIds.length === 0) {
    errors.push("missing_slur_patterns")
  }

  const lowIndex = NOTE_STEP_OPTIONS.findIndex(
    (step) => step.label === draft.range.low,
  )
  const highIndex = NOTE_STEP_OPTIONS.findIndex(
    (step) => step.label === draft.range.high,
  )

  if (lowIndex < 0 || highIndex < 0 || lowIndex > highIndex) {
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

  if (errors.includes("missing_slur_patterns")) {
    return "Pick at least one rhythm/articulation pattern."
  }

  if (errors.includes("invalid_range")) {
    return "Choose a valid range."
  }

  if (errors.includes("invalid_tempo")) {
    return "Choose a valid tempo."
  }

  return "Unable to create flow."
}
