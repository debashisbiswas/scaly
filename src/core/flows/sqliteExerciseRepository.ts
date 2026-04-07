import { and, asc, eq, isNull } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises } from "@/db/schema"

import { toExerciseKey } from "./exerciseKey"
import { GeneratedExerciseSpec } from "./service"

export type StoredExercise = {
  id: string
  exerciseKey: string
  spec: GeneratedExerciseSpec
}

function createExerciseId(flowId: string, now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `ex_${flowId}_${now.getTime()}_${randomSuffix}`
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
    .orderBy(asc(exercises.createdAt))
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
    .orderBy(asc(exercises.createdAt))

  return rows
    .map((row) => {
      const tempo = toTempo(row)

      if (!tempo) {
        return null
      }

      return {
        id: row.id,
        exerciseKey: row.exerciseKey,
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

export async function getExerciseByFlowIdAndExerciseKey(
  flowId: string,
  exerciseKey: string,
): Promise<StoredExercise | null> {
  const rows = await db
    .select()
    .from(exercises)
    .where(
      and(
        eq(exercises.flowId, flowId),
        eq(exercises.exerciseKey, exerciseKey),
        isNull(exercises.archivedAt),
      ),
    )
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
    id: row.id,
    exerciseKey: row.exerciseKey,
    spec: {
      key: row.key,
      mode: row.mode as GeneratedExerciseSpec["mode"],
      startOctave: row.startOctave,
      octaves: row.octaves,
      clef: row.clef as GeneratedExerciseSpec["clef"],
      tempo,
    },
  }
}

export async function upsertExerciseByFlowIdAndSpec({
  flowId,
  spec,
  now = new Date(),
}: {
  flowId: string
  spec: GeneratedExerciseSpec
  now?: Date
}): Promise<StoredExercise> {
  const exerciseKey = toExerciseKey(spec)

  await db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(exercises)
      .where(
        and(
          eq(exercises.flowId, flowId),
          eq(exercises.exerciseKey, exerciseKey),
        ),
      )
      .limit(1)

    const existing = existingRows[0]

    if (existing) {
      await tx
        .update(exercises)
        .set({
          key: spec.key,
          mode: spec.mode,
          startOctave: spec.startOctave,
          octaves: spec.octaves,
          clef: spec.clef,
          tempoKind: spec.tempo.kind,
          tempoBpm: spec.tempo.kind === "single" ? spec.tempo.bpm : null,
          tempoMinBpm: spec.tempo.kind === "range" ? spec.tempo.minBpm : null,
          tempoMaxBpm: spec.tempo.kind === "range" ? spec.tempo.maxBpm : null,
          archivedAt: null,
        })
        .where(eq(exercises.id, existing.id))

      return
    }

    await tx.insert(exercises).values({
      id: createExerciseId(flowId, now),
      flowId,
      exerciseKey,
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
    })
  })

  const stored = await getExerciseByFlowIdAndExerciseKey(flowId, exerciseKey)

  if (!stored) {
    throw new Error("Failed to upsert exercise by flow and exercise key.")
  }

  return stored
}
