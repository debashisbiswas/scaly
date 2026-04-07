import { eq, inArray } from "drizzle-orm"

import { db } from "@/db/client"
import { exercisePracticeStats } from "@/db/schema"

export type ExerciseRating = "again" | "hard" | "good" | "easy"

export type StoredExercisePracticeStats = {
  exerciseId: string
  totalAttempts: number
  againCount: number
  hardCount: number
  goodCount: number
  easyCount: number
  lastRating: ExerciseRating | null
  lastRatedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapRowToStats(
  row: typeof exercisePracticeStats.$inferSelect,
): StoredExercisePracticeStats {
  return {
    exerciseId: row.exerciseId,
    totalAttempts: row.totalAttempts,
    againCount: row.againCount,
    hardCount: row.hardCount,
    goodCount: row.goodCount,
    easyCount: row.easyCount,
    lastRating: (row.lastRating as ExerciseRating | null) ?? null,
    lastRatedAt: row.lastRatedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function getExercisePracticeStatsByExerciseId(
  exerciseId: string,
): Promise<StoredExercisePracticeStats | null> {
  const rows = await db
    .select()
    .from(exercisePracticeStats)
    .where(eq(exercisePracticeStats.exerciseId, exerciseId))
    .limit(1)

  const row = rows[0]

  return row ? mapRowToStats(row) : null
}

export async function listExercisePracticeStatsByExerciseIds(
  exerciseIds: string[],
): Promise<StoredExercisePracticeStats[]> {
  if (exerciseIds.length === 0) {
    return []
  }

  const rows = await db
    .select()
    .from(exercisePracticeStats)
    .where(inArray(exercisePracticeStats.exerciseId, exerciseIds))

  return rows.map(mapRowToStats)
}

export async function recordExerciseRating({
  exerciseId,
  rating,
  now = new Date(),
}: {
  exerciseId: string
  rating: ExerciseRating
  now?: Date
}): Promise<StoredExercisePracticeStats> {
  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(exercisePracticeStats)
      .where(eq(exercisePracticeStats.exerciseId, exerciseId))
      .limit(1)

    const existing = rows[0]

    if (!existing) {
      await tx.insert(exercisePracticeStats).values({
        exerciseId,
        totalAttempts: 1,
        againCount: rating === "again" ? 1 : 0,
        hardCount: rating === "hard" ? 1 : 0,
        goodCount: rating === "good" ? 1 : 0,
        easyCount: rating === "easy" ? 1 : 0,
        lastRating: rating,
        lastRatedAt: now,
        createdAt: now,
        updatedAt: now,
      })
      return
    }

    await tx
      .update(exercisePracticeStats)
      .set({
        totalAttempts: existing.totalAttempts + 1,
        againCount: existing.againCount + (rating === "again" ? 1 : 0),
        hardCount: existing.hardCount + (rating === "hard" ? 1 : 0),
        goodCount: existing.goodCount + (rating === "good" ? 1 : 0),
        easyCount: existing.easyCount + (rating === "easy" ? 1 : 0),
        lastRating: rating,
        lastRatedAt: now,
        updatedAt: now,
      })
      .where(eq(exercisePracticeStats.exerciseId, exerciseId))
  })

  const stats = await getExercisePracticeStatsByExerciseId(exerciseId)

  if (!stats) {
    throw new Error("Failed to persist exercise practice stats.")
  }

  return stats
}
