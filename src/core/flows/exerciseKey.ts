import { TempoSetting } from "./types"

export type ExerciseSpecIdentity = {
  key: string
  mode: "major" | "minor" | "harmonic minor" | "melodic minor"
  rhythm: "long octave" | "sixteenths" | "eighth two sixteenths"
  slurPattern:
    | "slur two tongue two"
    | "tongue two slur two"
    | "slur two slur two"
    | "tongue one slur two tongue one"
    | "tongue one slur three"
    | "slur three tongue one"
    | "tongued"
    | "slur four"
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
    `r=${spec.rhythm}`,
    `s=${spec.slurPattern}`,
    `so=${spec.startOctave}`,
    `o=${spec.octaves}`,
    `c=${spec.clef}`,
    `t=${toTempoToken(spec.tempo)}`,
  ].join("|")
}
