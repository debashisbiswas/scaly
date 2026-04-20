import { FlowDraft, FlowDraftValidationError } from "./types"

export type CreateFlowFromDraftResult =
  | {
      ok: true
      flowId: string
      exerciseCount: number
    }
  | {
      ok: false
      errors: FlowDraftValidationError[]
      message: string
    }

export type UpdateFlowFromDraftInput = {
  flowId: string
  name: string
  draft: FlowDraft
  now?: Date
  resetProgress: true
}

export type UpdateFlowFromDraftResult =
  | {
      ok: true
      flowId: string
      exerciseCount: number
    }
  | {
      ok: false
      errors: FlowDraftValidationError[]
      message: string
    }
