import { FlowDraft, FlowDraftValidationError } from "./types"

/**
 * Domain policy (v1): editing a flow regenerates exercises and resets progress.
 */
export const FLOW_EDIT_POLICY = "regenerate_and_reset_progress" as const

export type CreateFlowFromDraftInput = {
  name: string
  draft: FlowDraft
  now?: Date
}

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

export interface FlowGenerationService {
  createFlowFromDraft(
    input: CreateFlowFromDraftInput,
  ): Promise<CreateFlowFromDraftResult>
  updateFlowFromDraft(
    input: UpdateFlowFromDraftInput,
  ): Promise<UpdateFlowFromDraftResult>
}
