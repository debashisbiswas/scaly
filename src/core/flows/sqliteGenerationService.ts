import { eq } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises, flows } from "@/db/schema"

import {
  CreateFlowFromDraftInput,
  CreateFlowFromDraftResult,
  FlowGenerationService,
  UpdateFlowFromDraftInput,
  UpdateFlowFromDraftResult,
} from "./domain"
import { toExerciseKey } from "./exerciseKey"
import {
  expandFlowDraftToExerciseSpecs,
  getFlowCreationErrorMessage,
  validateFlowDraft,
} from "./service"

function createFlowId(now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `flow_${now.getTime()}_${randomSuffix}`
}

function createExerciseId(flowId: string, position: number, now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `ex_${flowId}_${position}_${now.getTime()}_${randomSuffix}`
}

function toFlowErrorResult(
  errors: ReturnType<typeof validateFlowDraft>,
  name: string,
): Extract<CreateFlowFromDraftResult, { ok: false }> {
  return {
    ok: false,
    errors,
    message: getFlowCreationErrorMessage(errors, name),
  }
}

export class SqliteFlowGenerationService implements FlowGenerationService {
  async createFlowFromDraft({
    name,
    draft,
    now = new Date(),
  }: CreateFlowFromDraftInput): Promise<CreateFlowFromDraftResult> {
    const errors = validateFlowDraft(draft)

    if (name.trim().length === 0 || errors.length > 0) {
      return toFlowErrorResult(errors, name)
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)
    const flowId = createFlowId(now)

    await db.transaction(async (tx) => {
      await tx.insert(flows).values({
        id: flowId,
        name: name.trim(),
        configJson: JSON.stringify(draft),
        progressPercent: 0,
        createdAt: now,
        updatedAt: now,
      })

      if (generated.length === 0) {
        return
      }

      await tx.insert(exercises).values(
        generated.map((spec, position) => ({
          id: createExerciseId(flowId, position, now),
          flowId,
          position,
          exerciseKey: toExerciseKey(spec),
          key: spec.key,
          mode: spec.mode,
          startOctave: spec.startOctave,
          octaves: spec.octaves,
          clef: spec.clef,
          tempoKind: spec.tempo.kind,
          tempoBpm: spec.tempo.kind === "single" ? spec.tempo.bpm : null,
          tempoMinBpm: spec.tempo.kind === "range" ? spec.tempo.minBpm : null,
          tempoMaxBpm: spec.tempo.kind === "range" ? spec.tempo.maxBpm : null,
          createdAt: now,
          archivedAt: null,
        })),
      )
    })

    return {
      ok: true,
      flowId,
      exerciseCount: generated.length,
    }
  }

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

      if (generated.length === 0) {
        return
      }

      await tx.insert(exercises).values(
        generated.map((spec, position) => ({
          id: createExerciseId(flowId, position, now),
          flowId,
          position,
          exerciseKey: toExerciseKey(spec),
          key: spec.key,
          mode: spec.mode,
          startOctave: spec.startOctave,
          octaves: spec.octaves,
          clef: spec.clef,
          tempoKind: spec.tempo.kind,
          tempoBpm: spec.tempo.kind === "single" ? spec.tempo.bpm : null,
          tempoMinBpm: spec.tempo.kind === "range" ? spec.tempo.minBpm : null,
          tempoMaxBpm: spec.tempo.kind === "range" ? spec.tempo.maxBpm : null,
          createdAt: now,
          archivedAt: null,
        })),
      )
    })

    return {
      ok: true,
      flowId,
      exerciseCount: generated.length,
    }
  }
}

export const sqliteFlowGenerationService = new SqliteFlowGenerationService()
