import { and, asc, eq, isNull, sql } from "drizzle-orm"

import { db } from "@/db/client"
import { exercises } from "@/db/schema"

import { toExerciseKey } from "./exerciseKey"
import { GeneratedExerciseSpec } from "./service"

export namespace Exercise {
  export async function list(flowId: string) {
    const rows = await db
      .select()
      .from(exercises)
      .where(and(eq(exercises.flowId, flowId), isNull(exercises.archivedAt)))
      .orderBy(asc(exercises.createdAt))

    return rows.map(serialize).filter((value) => value !== null)
  }

  export async function upsert(flowId: string, spec: GeneratedExerciseSpec) {
    function createExerciseId(flowId: string, now: Date) {
      const randomSuffix = Math.random().toString(36).slice(2, 8)
      return `ex_${flowId}_${now.getTime()}_${randomSuffix}`
    }

    const now = new Date()
    const exerciseKey = toExerciseKey(spec)

    const result = await db
      .insert(exercises)
      .values({
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
      .onConflictDoUpdate({
        target: [exercises.flowId, exercises.exerciseKey],
        set: {
          // I don't want to do anything on conflict, but still want the query
          // to return the data.
          // https://github.com/drizzle-team/drizzle-orm/issues/2474
          exerciseKey: sql`${exercises.exerciseKey}`,
        },
      })
      .returning()

    return result.map(serialize).at(0)
  }

  function toTempo(row: typeof exercises.$inferSelect) {
    if (row.tempoKind === "single" && typeof row.tempoBpm === "number") {
      return { kind: "single", bpm: row.tempoBpm } as const
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
      } as const
    }

    return null
  }

  function serialize(row: typeof exercises.$inferSelect) {
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
}
