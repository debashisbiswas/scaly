import { inArray, sql } from "drizzle-orm"

import { db } from "@/db/client"
import { exercisePracticeStats } from "@/db/schema"

export namespace ExercisePracticeStats {
  export type Rating = "again" | "hard" | "good" | "easy"

  export type Shape = {
    exerciseId: string
    totalAttempts: number
    againCount: number
    hardCount: number
    goodCount: number
    easyCount: number
    lastRating: Rating | null
    lastRatedAt: Date | null
    createdAt: Date
    updatedAt: Date
  }

  export async function listByExerciseIDs(exerciseIds: string[]) {
    const rows = await db
      .select()
      .from(exercisePracticeStats)
      .where(inArray(exercisePracticeStats.exerciseId, exerciseIds))

    return rows.map(serialize)
  }

  export async function recordExerciseRating(
    exerciseId: string,
    rating: Rating,
  ) {
    const now = new Date()

    const rows = await db
      .insert(exercisePracticeStats)
      .values({
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
      .onConflictDoUpdate({
        target: [exercisePracticeStats.exerciseId],
        set: {
          totalAttempts: sql`${exercisePracticeStats.totalAttempts} + 1`,
          againCount: sql`${exercisePracticeStats.againCount} + ${rating === "again" ? 1 : 0}`,
          hardCount: sql`${exercisePracticeStats.hardCount} + ${rating === "hard" ? 1 : 0}`,
          goodCount: sql`${exercisePracticeStats.goodCount} + ${rating === "good" ? 1 : 0}`,
          easyCount: sql`${exercisePracticeStats.easyCount} + ${rating === "easy" ? 1 : 0}`,
          lastRating: sql`${exercisePracticeStats.lastRating}`,
          lastRatedAt: sql`${exercisePracticeStats.lastRatedAt}`,
          updatedAt: sql`${exercisePracticeStats.updatedAt}`,
        },
      })
      .returning()

    return rows.map(serialize).at(0)
  }

  export function getExercisePracticeWeight(stats: Shape | null) {
    if (!stats || stats.totalAttempts <= 0) {
      return 2.25
    }

    const total = stats.totalAttempts
    const difficultyRatio =
      (stats.againCount * 1 + stats.hardCount * 0.7 + stats.goodCount * 0.2) /
      total
    const familiarityBoost = Math.min(1, 4 / Math.sqrt(total + 1))

    return 0.5 + difficultyRatio * 2.2 + familiarityBoost
  }

  function serialize(row: typeof exercisePracticeStats.$inferSelect): Shape {
    return {
      exerciseId: row.exerciseId,
      totalAttempts: row.totalAttempts,
      againCount: row.againCount,
      hardCount: row.hardCount,
      goodCount: row.goodCount,
      easyCount: row.easyCount,
      lastRating: (row.lastRating as Rating | null) ?? null,
      lastRatedAt: row.lastRatedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
