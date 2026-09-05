import { CLEF_OPTIONS, KEY_SIGNATURE_OPTIONS, MODE_OPTIONS } from "./constants"
import { FlowDraft } from "./flow-draft"

export type KeySignature = (typeof KEY_SIGNATURE_OPTIONS)[number]
export type Clef = (typeof CLEF_OPTIONS)[number]
export type ScaleMode = (typeof MODE_OPTIONS)[number]

export type TempoSetting =
  | { kind: "single"; bpm: number }
  | { kind: "range"; minBpm: number; maxBpm: number }

export type Flow = {
  id: string
  name: string
  config: FlowDraft.Shape
  progressPercent: number
  createdAt: string
  updatedAt: string
}

export type CreateFlowResult =
  | { ok: true; value: Flow }
  | { ok: false; errors: FlowDraft.ValidationError[] }
