import {
  CLEF_OPTIONS,
  KEY_SIGNATURE_OPTIONS,
  MODE_OPTIONS,
  SLUR_PATTERN_OPTIONS,
} from "./constants"

export type KeySignature = (typeof KEY_SIGNATURE_OPTIONS)[number]
export type Clef = (typeof CLEF_OPTIONS)[number]
export type ScaleMode = (typeof MODE_OPTIONS)[number]
export type SlurPatternId = (typeof SLUR_PATTERN_OPTIONS)[number]["id"]
export type PitchLabel = string

export type TempoSetting =
  | { kind: "single"; bpm: number }
  | { kind: "range"; minBpm: number; maxBpm: number }

export type FlowDraft = {
  keys: KeySignature[]
  clef: Clef | null
  range: {
    low: PitchLabel
    high: PitchLabel
  }
  modes: ScaleMode[]
  tempo: TempoSetting
  slurPatternIds: SlurPatternId[]
}

export type Flow = {
  id: string
  name: string
  config: FlowDraft
  progressPercent: number
  createdAt: string
  updatedAt: string
}

export type FlowDraftValidationError =
  | "missing_keys"
  | "missing_clef"
  | "missing_modes"
  | "missing_slur_patterns"
  | "invalid_range"
  | "invalid_tempo"

export type CreateFlowResult =
  | { ok: true; value: Flow }
  | { ok: false; errors: FlowDraftValidationError[] }
