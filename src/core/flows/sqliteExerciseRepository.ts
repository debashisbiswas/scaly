import { and, eq, isNull } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises } from "@/db/schema"

import { GeneratedExerciseSpec } from "./service"

export type StoredExercise = {
  id: string
  spec: GeneratedExerciseSpec
}

function toTempo(
  row: typeof exercises.$inferSelect,
): GeneratedExerciseSpec["tempo"] | null {
  if (row.tempoKind === "single" && typeof row.tempoBpm === "number") {
    return { kind: "single", bpm: row.tempoBpm }
  }

  if (
    row.tempoKind === "range" &&
    typeof row.tempoMinBpm === "number" &&
    typeof row.tempoMaxBpm === "number"
  ) {
    return {
      kind: "range",
      minBpm: row.tempoMinBpm,
      maxBpm: row.tempoMaxBpm,
    }
  }

  return null
}

export async function getFirstExerciseSpecByFlowId(flowId: string) {
  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.flowId, flowId), isNull(exercises.archivedAt)))
    .limit(1)

  const row = rows[0]

  if (!row) {
    return null
  }

  const tempo = toTempo(row)

  if (!tempo) {
    return null
  }

  return {
    key: row.key,
    mode: row.mode as GeneratedExerciseSpec["mode"],
    startOctave: row.startOctave,
    octaves: row.octaves,
    clef: row.clef as GeneratedExerciseSpec["clef"],
    tempo,
  }
}

export async function getFirstExerciseByFlowId(flowId: string): Promise<{
  id: string
  spec: GeneratedExerciseSpec
} | null> {
  const items = await listExercisesByFlowId(flowId)

  return items[0]
    ? {
        id: items[0].id,
        spec: items[0].spec,
      }
    : null
}

export async function listExercisesByFlowId(
  flowId: string,
): Promise<StoredExercise[]> {
  const rows = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.flowId, flowId), isNull(exercises.archivedAt)))

  return rows
    .map((row) => {
      const tempo = toTempo(row)

      if (!tempo) {
        return null
      }

      return {
        id: row.id,
        spec: {
          key: row.key,
          mode: row.mode as GeneratedExerciseSpec["mode"],
          startOctave: row.startOctave,
          octaves: row.octaves,
          clef: row.clef as GeneratedExerciseSpec["clef"],
          tempo,
        },
      }
    })
    .filter((value): value is StoredExercise => value !== null)
}
