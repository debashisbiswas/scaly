import { eq } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises, flows } from "@/db/schema"

import { UpdateFlowFromDraftInput, UpdateFlowFromDraftResult } from "./domain"
import {
  expandFlowDraftToExerciseSpecs,
  getFlowCreationErrorMessage,
  validateFlowDraft,
} from "./service"

function toFlowErrorResult(
  errors: ReturnType<typeof validateFlowDraft>,
  name: string,
) {
  return {
    ok: false,
    errors,
    message: getFlowCreationErrorMessage(errors, name),
  } as const
}

export class SqliteFlowGenerationService {
  async updateFlowFromDraft({
    flowId,
    name,
    draft,
    now = new Date(),
    resetProgress,
  }: UpdateFlowFromDraftInput): Promise<UpdateFlowFromDraftResult> {
    const errors = validateFlowDraft(draft)

    if (name.trim().length === 0 || errors.length > 0) {
      return toFlowErrorResult(errors, name)
    }

    if (!resetProgress) {
      return {
        ok: false,
        errors: [],
        message: "Editing a flow currently requires resetting progress.",
      }
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)

    await db.transaction(async (tx) => {
      await tx
        .update(flows)
        .set({
          name: name.trim(),
          configJson: JSON.stringify(draft),
          progressPercent: 0,
          updatedAt: now,
        })
        .where(eq(flows.id, flowId))

      await tx.delete(exercises).where(eq(exercises.flowId, flowId))
    })

    return {
      ok: true,
      flowId,
      exerciseCount: generated.length,
    }
  }
}

export const sqliteFlowGenerationService = new SqliteFlowGenerationService()
