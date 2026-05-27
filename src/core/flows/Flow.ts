import { desc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { flows } from "@/db/schema"

import {
  createEmptyFlowDraft,
  expandFlowDraftToExerciseSpecs,
  getFlowCreationErrorMessage,
  validateFlowDraft,
} from "./service"
import { FlowDraft } from "./types"

export namespace Flow2 {
  export type Shape = {
    id: string
    name: string
    config: FlowDraft
    progressPercent: number
    createdAt: string
    updatedAt: string
  }

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

  export async function createFromDraft({
    name,
    draft,
  }: {
    name: string
    draft: FlowDraft
  }) {
    const errors = validateFlowDraft(draft)

    if (name.trim().length === 0 || errors.length > 0) {
      return toFlowErrorResult(errors, name)
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)

    const now = new Date()
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const flowId = `flow_${now.getTime()}_${randomSuffix}`

    await db.transaction(async (tx) => {
      await tx.insert(flows).values({
        id: flowId,
        name: name.trim(),
        configJson: JSON.stringify(draft),
        progressPercent: 0,
        createdAt: now,
        updatedAt: now,
      })
    })

    return {
      ok: true,
      flowId,
      exerciseCount: generated.length,
    } as const
  }

  export async function updateFromDraft({
    flowId,
    name,
    draft,
    now = new Date(),
  }: {
    flowId: string
    name: string
    draft: FlowDraft
    now?: Date
  }) {
    const errors = validateFlowDraft(draft)

    if (name.trim().length === 0 || errors.length > 0) {
      return toFlowErrorResult(errors, name)
    }

    const existingFlow = await fromID(flowId)

    if (!existingFlow) {
      return {
        ok: false,
        errors: [],
        message: "Unable to find this flow.",
      } as const
    }

    const nextConfigJson = JSON.stringify(draft)
    const configChanged = nextConfigJson !== JSON.stringify(existingFlow.config)

    await db
      .update(flows)
      .set({
        name: name.trim(),
        configJson: nextConfigJson,
        progressPercent: configChanged ? 0 : existingFlow.progressPercent,
        updatedAt: now,
      })
      .where(eq(flows.id, flowId))

    return {
      ok: true,
      flowId,
      exerciseCount: expandFlowDraftToExerciseSpecs(draft).length,
    } as const
  }

  export async function deleteByID(id: string) {
    await db.delete(flows).where(eq(flows.id, id))
  }

  export async function list() {
    const rows = await db.select().from(flows).orderBy(desc(flows.updatedAt))
    return rows.map(serialize)
  }

  export async function fromID(id: string) {
    const rows = await db.select().from(flows).where(eq(flows.id, id)).limit(1)
    return rows.map(serialize).at(0)
  }

  function serialize(row: typeof flows.$inferSelect): Shape {
    function parseFlowDraft(configJson: string): FlowDraft {
      try {
        return JSON.parse(configJson) as FlowDraft
      } catch {
        return createEmptyFlowDraft()
      }
    }

    function toIsoString(value: Date | number | string) {
      if (value instanceof Date) {
        return value.toISOString()
      }

      if (typeof value === "number") {
        return new Date(value).toISOString()
      }

      return new Date(value).toISOString()
    }

    return {
      id: row.id,
      name: row.name,
      config: parseFlowDraft(row.configJson),
      progressPercent: row.progressPercent,
      createdAt: toIsoString(row.createdAt),
      updatedAt: toIsoString(row.updatedAt),
    }
  }
}
