import { GeneratedExerciseSpec } from "@/core/flows"

import { Mode, Modes, generateScaleNotation } from "./Scales"
import { MusicIR } from "./musicir"

export type ExerciseNotationResult =
  | { status: "ready"; score: MusicIR.Score }
  | { status: "unsupported" }

type ExerciseNotationRenderer = {
  canRender: (spec: GeneratedExerciseSpec) => boolean
  render: (spec: GeneratedExerciseSpec) => MusicIR.Score
}

function isScaleMode(mode: GeneratedExerciseSpec["mode"]): mode is Mode {
  return (Modes as readonly string[]).includes(mode)
}

const scaleRenderer: ExerciseNotationRenderer = {
  canRender: (spec) => isScaleMode(spec.mode),
  render: (spec) => {
    if (!isScaleMode(spec.mode)) {
      throw new Error(`Scale renderer cannot render mode: ${spec.mode}`)
    }

    return generateScaleNotation({
      key: spec.key,
      mode: spec.mode,
      rhythm: "long octave",
      slurPattern: "tongued",
      octaves: spec.octaves,
      startOctave: spec.startOctave,
      clef: spec.clef,
    })
  },
}

const notationRenderers: ExerciseNotationRenderer[] = [scaleRenderer]

export function getExerciseNotation(
  spec: GeneratedExerciseSpec,
): ExerciseNotationResult {
  const renderer = notationRenderers.find((candidate) =>
    candidate.canRender(spec),
  )

  if (!renderer) {
    return { status: "unsupported" }
  }

  return { status: "ready", score: renderer.render(spec) }
}
