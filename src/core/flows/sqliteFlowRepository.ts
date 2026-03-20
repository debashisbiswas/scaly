import { desc, eq } from "drizzle-orm"

import { db } from "@/db/client"
import { flows } from "@/db/schema"

import { createEmptyFlowDraft } from "./service"
import { Flow, FlowDraft } from "./types"

function toIsoString(value: Date | number | string) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === "number") {
    return new Date(value).toISOString()
  }

  return new Date(value).toISOString()
}

function parseFlowDraft(configJson: string): FlowDraft {
  try {
    return JSON.parse(configJson) as FlowDraft
  } catch {
    return createEmptyFlowDraft()
  }
}

function mapFlowRowToFlow(row: typeof flows.$inferSelect): Flow {
  return {
    id: row.id,
    name: row.name,
    config: parseFlowDraft(row.configJson),
    progressPercent: row.progressPercent,
    createdAt: toIsoString(row.createdAt),
    updatedAt: toIsoString(row.updatedAt),
  }
}

export async function listStoredFlows() {
  const rows = await db.select().from(flows).orderBy(desc(flows.updatedAt))

  return rows.map(mapFlowRowToFlow)
}

export async function getStoredFlowById(id: string) {
  const rows = await db.select().from(flows).where(eq(flows.id, id)).limit(1)
  const row = rows[0]

  return row ? mapFlowRowToFlow(row) : undefined
}
