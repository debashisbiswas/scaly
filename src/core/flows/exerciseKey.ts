import { TempoSetting } from "./types"

export type ExerciseSpecIdentity = {
  key: string
  mode: "major" | "minor" | "harmonic minor" | "melodic minor"
  startOctave: number
  octaves: number
  clef: "treble" | "bass"
  tempo: TempoSetting
}

function toTempoToken(tempo: TempoSetting) {
  if (tempo.kind === "single") {
    return `single:${tempo.bpm}`
  }

  return `range:${tempo.minBpm}-${tempo.maxBpm}`
}

export function toExerciseKey(spec: ExerciseSpecIdentity) {
  return [
    `k=${spec.key}`,
    `m=${spec.mode}`,
    `so=${spec.startOctave}`,
    `o=${spec.octaves}`,
    `c=${spec.clef}`,
    `t=${toTempoToken(spec.tempo)}`,
  ].join("|")
}
