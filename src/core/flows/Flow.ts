import { desc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { flows } from "@/db/schema"

import { createEmptyFlowDraft } from "./service"
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
