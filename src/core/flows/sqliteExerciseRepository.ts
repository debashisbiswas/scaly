import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises } from "@/db/schema"

import { GeneratedExerciseSpec } from "./service"

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
    .orderBy(asc(exercises.position))
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
    rhythm: row.rhythmPattern as GeneratedExerciseSpec["rhythm"],
    slurPattern: row.slurPattern as GeneratedExerciseSpec["slurPattern"],
    startOctave: row.startOctave,
    octaves: row.octaves,
    clef: row.clef as GeneratedExerciseSpec["clef"],
    tempo,
  }
}
