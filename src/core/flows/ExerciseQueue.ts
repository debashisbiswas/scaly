import { ExercisePracticeStats } from "./ExercisePracticeStats"
import { GeneratedExerciseSpec } from "./service"

export namespace ExerciseQueue {
  export type PracticeExercise = {
    id: string | null
    exerciseKey: string
    spec: GeneratedExerciseSpec
    stats: ExercisePracticeStats.Shape | null
    assignedTempo: number
  }

  export function pickWeightedExerciseIndex(
    exercises: PracticeExercise[],
    currentIndex: number,
  ) {
    if (exercises.length === 0) {
      return -1
    }

    if (exercises.length === 1) {
      return 0
    }

    const nonCurrentCandidates = exercises
      .map((exercise, index) => ({
        index,
        exercise,
        weight: ExercisePracticeStats.getExercisePracticeWeight(exercise.stats),
      }))
      .filter((candidate) => candidate.index !== currentIndex)
    const unseenCandidates = nonCurrentCandidates.filter(
      (candidate) => candidate.exercise.id === null,
    )

    const weightedCandidates =
      unseenCandidates.length > 0 ? unseenCandidates : nonCurrentCandidates

    const totalWeight = weightedCandidates.reduce(
      (sum, candidate) => sum + candidate.weight,
      0,
    )

    if (totalWeight <= 0) {
      return (currentIndex + 1) % exercises.length
    }

    const target = Math.random() * totalWeight
    let runningWeight = 0

    for (const candidate of weightedCandidates) {
      runningWeight += candidate.weight

      if (target <= runningWeight) {
        return candidate.index
      }
    }

    return weightedCandidates[weightedCandidates.length - 1]?.index ?? 0
  }
}
