import { GeneratedExerciseSpec } from "./service"
import { TempoSetting } from "./types"

function toTempoToken(tempo: TempoSetting) {
  if (tempo.kind === "single") {
    return `single:${tempo.bpm}`
  }

  return `range:${tempo.minBpm}-${tempo.maxBpm}`
}

export function toExerciseKey(spec: GeneratedExerciseSpec) {
  return [
    `k=${spec.key}`,
    `m=${spec.mode}`,
    `so=${spec.startOctave}`,
    `o=${spec.octaves}`,
    `c=${spec.clef}`,
    `t=${toTempoToken(spec.tempo)}`,
  ].join("|")
}
