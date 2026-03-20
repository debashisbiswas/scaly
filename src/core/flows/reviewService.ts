import { eq } from "drizzle-orm"

import { db } from "@/db/client"
import { exerciseAttempts, exerciseSrsState } from "@/db/schema"

export type ExerciseReviewRating = "again" | "hard" | "good" | "easy"

type NextSrsState = {
  dueAt: Date
  intervalDays: number
  easeFactor: number
  reps: number
  lapses: number
  lastReviewedAt: Date
}

const MIN_EASE_FACTOR = 1.3
const INITIAL_EASE_FACTOR = 2.5
const AGAIN_INTERVAL_DAYS = 15 / (24 * 60)

function clampEase(value: number) {
  return Math.max(MIN_EASE_FACTOR, value)
}

function toDueAt(now: Date, intervalDays: number) {
  const dayMs = 24 * 60 * 60 * 1000
  return new Date(now.getTime() + intervalDays * dayMs)
}

function calculateNextSrsState({
  current,
  rating,
  reviewedAt,
}: {
  current:
    | {
        intervalDays: number
        easeFactor: number
        reps: number
        lapses: number
      }
    | undefined
  rating: ExerciseReviewRating
  reviewedAt: Date
}): NextSrsState {
  const previousInterval = current?.intervalDays ?? 0
  const previousEase = current?.easeFactor ?? INITIAL_EASE_FACTOR
  const previousReps = current?.reps ?? 0
  const previousLapses = current?.lapses ?? 0

  if (rating === "again") {
    const intervalDays = AGAIN_INTERVAL_DAYS
    const easeFactor = clampEase(previousEase - 0.2)

    return {
      dueAt: toDueAt(reviewedAt, intervalDays),
      intervalDays,
      easeFactor,
      reps: previousReps + 1,
      lapses: previousLapses + 1,
      lastReviewedAt: reviewedAt,
    }
  }

  if (rating === "hard") {
    const intervalDays =
      previousInterval <= 0 ? 1 : Math.max(1, previousInterval * 1.2)
    const easeFactor = clampEase(previousEase - 0.15)

    return {
      dueAt: toDueAt(reviewedAt, intervalDays),
      intervalDays,
      easeFactor,
      reps: previousReps + 1,
      lapses: previousLapses,
      lastReviewedAt: reviewedAt,
    }
  }

  if (rating === "easy") {
    const intervalDays =
      previousInterval <= 0
        ? 2
        : Math.max(1, previousInterval * (previousEase + 0.15))
    const easeFactor = previousEase + 0.1

    return {
      dueAt: toDueAt(reviewedAt, intervalDays),
      intervalDays,
      easeFactor,
      reps: previousReps + 1,
      lapses: previousLapses,
      lastReviewedAt: reviewedAt,
    }
  }

  const intervalDays =
    previousInterval <= 0 ? 1 : Math.max(1, previousInterval * previousEase)

  return {
    dueAt: toDueAt(reviewedAt, intervalDays),
    intervalDays,
    easeFactor: previousEase,
    reps: previousReps + 1,
    lapses: previousLapses,
    lastReviewedAt: reviewedAt,
  }
}

function createAttemptId(exerciseId: string, now: Date) {
  const randomSuffix = Math.random().toString(36).slice(2, 8)
  return `attempt_${exerciseId}_${now.getTime()}_${randomSuffix}`
}

export async function recordExerciseReview({
  exerciseId,
  rating,
  reviewedAt = new Date(),
  bpmUsed,
  notesHidden,
}: {
  exerciseId: string
  rating: ExerciseReviewRating
  reviewedAt?: Date
  bpmUsed?: number
  notesHidden?: boolean
}) {
  await db.transaction(async (tx) => {
    await tx.insert(exerciseAttempts).values({
      id: createAttemptId(exerciseId, reviewedAt),
      exerciseId,
      rating,
      performedAt: reviewedAt,
      bpmUsed: typeof bpmUsed === "number" ? bpmUsed : null,
      notesHidden: typeof notesHidden === "boolean" ? notesHidden : null,
    })

    const currentRows = await tx
      .select()
      .from(exerciseSrsState)
      .where(eq(exerciseSrsState.exerciseId, exerciseId))
      .limit(1)
    const current = currentRows[0]

    const nextState = calculateNextSrsState({
      current:
        current === undefined
          ? undefined
          : {
              intervalDays: current.intervalDays,
              easeFactor: current.easeFactor,
              reps: current.reps,
              lapses: current.lapses,
            },
      rating,
      reviewedAt,
    })

    if (!current) {
      await tx.insert(exerciseSrsState).values({
        exerciseId,
        dueAt: nextState.dueAt,
        lastReviewedAt: nextState.lastReviewedAt,
        intervalDays: nextState.intervalDays,
        easeFactor: nextState.easeFactor,
        reps: nextState.reps,
        lapses: nextState.lapses,
      })
      return
    }

    await tx
      .update(exerciseSrsState)
      .set({
        dueAt: nextState.dueAt,
        lastReviewedAt: nextState.lastReviewedAt,
        intervalDays: nextState.intervalDays,
        easeFactor: nextState.easeFactor,
        reps: nextState.reps,
        lapses: nextState.lapses,
      })
      .where(eq(exerciseSrsState.exerciseId, exerciseId))
  })
}
