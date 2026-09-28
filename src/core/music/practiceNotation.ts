import { GeneratedExerciseSpec } from "@/core/flows"

import { Mode, Modes } from "./modes"
import { generateArpeggio } from "./patterns/arpeggios"
import { generateScaleNotation } from "./patterns/scales"
import { generateThirds } from "./patterns/thirds"
import { MusicIR } from "./musicir"

export type ExerciseNotationResult =
  | { status: "ready"; score: MusicIR.Score }
  | { status: "unsupported" }

type ExerciseNotationRenderer = {
  canRender: (spec: GeneratedExerciseSpec) => boolean
  render: (spec: GeneratedExerciseSpec) => MusicIR.Score
}

function isScaleMode(mode: string): mode is Mode {
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

const arpeggioRenderer: ExerciseNotationRenderer = {
  canRender: (spec) => spec.mode.includes("arpeggio"),
  render: (spec) => {
    // TODO... yeah
    const musicMode = spec.mode.replace(" arpeggio", "")
    if (!isScaleMode(musicMode)) {
      throw new Error(`Arpeggio renderer cannot render mode: ${spec.mode}`)
    }

    return generateArpeggio({
      key: spec.key,
      mode: musicMode,
      octaves: spec.octaves,
      startOctave: spec.startOctave,
      clef: spec.clef,
    })
  },
}

function getThirdsMode(mode: string): "major" | "minor" | undefined {
  if (mode === "major thirds") return "major"
  if (mode === "minor thirds") return "minor"
}

const thirdsRenderer: ExerciseNotationRenderer = {
  canRender: (spec) =>
    getThirdsMode(spec.mode) !== undefined &&
    spec.octaves >= 1 &&
    spec.octaves <= 3,
  render: (spec) => {
    const mode = getThirdsMode(spec.mode)

    if (!mode) {
      throw new Error(`Thirds renderer cannot render mode: ${spec.mode}`)
    }

    return generateThirds({
      key: spec.key,
      mode,
      octaves: spec.octaves,
      startOctave: spec.startOctave,
      clef: spec.clef,
    })
  },
}

const notationRenderers: ExerciseNotationRenderer[] = [
  scaleRenderer,
  arpeggioRenderer,
  thirdsRenderer,
]

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
