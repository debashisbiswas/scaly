import { Note, Range, Scale } from "tonal"

import { MusicIR } from "../musicir"
import { getKeyWithMode } from "../modes"

type ThirdsOptions = {
  key: string
  mode: "major" | "minor"
  startOctave: number
  octaves: number
}

function toPitch(noteName: string): MusicIR.Pitch {
  const note = Note.get(noteName)

  if (!MusicIR.isStep(note.letter)) {
    throw new Error(`Unexpected note step: ${note.letter}`)
  }

  return {
    step: note.letter,
    accidental: note.alt || undefined,
    octave: note.oct ?? 1,
  }
}

function validateOptions(opts: ThirdsOptions) {
  if (opts.startOctave < 1) {
    throw new Error(
      `Start octave must be at least 1, received: ${opts.startOctave}`,
    )
  }

  if (opts.octaves < 1 || opts.octaves > 3) {
    throw new Error(`Unsupported thirds octave count: ${opts.octaves}`)
  }
}

export function getThirdsSkeleton(opts: ThirdsOptions): MusicIR.Pitch[] {
  validateOptions(opts)

  const ascendingScaleSteps = Scale.steps(
    `${opts.key}${opts.startOctave} ${opts.mode === "minor" ? "melodic minor" : "major"}`,
  )
  const descendingScaleSteps = Scale.steps(
    `${opts.key}${opts.startOctave} ${opts.mode}`,
  )
  const topScaleStep = 7 * opts.octaves

  const ascending = Range.numeric([0, topScaleStep - 1]).flatMap(
    (scaleStep) => [
      ascendingScaleSteps(scaleStep),
      ascendingScaleSteps(scaleStep + 2),
    ],
  )
  const descending = Range.numeric([topScaleStep, 1]).flatMap((scaleStep) => [
    descendingScaleSteps(scaleStep),
    descendingScaleSteps(scaleStep - 2),
  ])

  return [...ascending, ...descending, descendingScaleSteps(0)].map(toPitch)
}

export function generateThirds(
  opts: ThirdsOptions & { clef: "treble" | "bass" },
) {
  const skeleton = getThirdsSkeleton(opts)
  const measures: MusicIR.Measure[] = []
  let currentMeasure: MusicIR.Measure = { notes: [] }
  let currentDuration = 0

  for (const [index, pitch] of skeleton.entries()) {
    const duration =
      index === skeleton.length - 1 && opts.octaves === 2
        ? "half"
        : index === skeleton.length - 1
          ? "quarter"
          : "sixteenth"

    currentMeasure.notes.push({ pitch, duration })
    currentDuration += MusicIR.durationInSixteenths(duration)

    const measureDuration = opts.octaves === 3 ? 44 : 16

    if (currentDuration === measureDuration) {
      measures.push(currentMeasure)
      currentMeasure = { notes: [] }
      currentDuration = 0
    }
  }

  if (currentMeasure.notes.length > 0) {
    throw new Error("Thirds pattern did not fill its final measure")
  }

  measures[measures.length - 1].finalBarline = true

  return {
    keySignature: { fifths: getKeyWithMode(opts.key, opts.mode).alteration },
    timeSignature: {
      numerator: opts.octaves === 3 ? 11 : 4,
      denominator: 4,
    },
    clef: opts.clef,
    measures,
  } satisfies MusicIR.Score
}
