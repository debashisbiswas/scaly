import { KEY_SIGNATURE_OPTIONS } from "./constants"
import { FlowDraft } from "./flow-draft"

export type KeySignature = (typeof KEY_SIGNATURE_OPTIONS)[number]
export type Clef = "Treble Clef" | "Bass Clef"

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
