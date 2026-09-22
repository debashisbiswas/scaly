import { Note, Range, Scale } from "tonal"

import { MusicIR } from "../musicir"
import { Mode, getKeyWithMode } from "../modes"

type ThirdsOptions = {
  key: string
  mode: Mode
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

  if (opts.octaves !== 1 && opts.octaves !== 2) {
    throw new Error(`Unsupported thirds octave count: ${opts.octaves}`)
  }
}

export function getThirdsSkeleton(opts: ThirdsOptions): MusicIR.Pitch[] {
  validateOptions(opts)

  const scaleSteps = Scale.steps(`${opts.key}${opts.startOctave} ${opts.mode}`)
  const topScaleStep = 7 * opts.octaves

  const ascending = Range.numeric([0, topScaleStep]).flatMap((scaleStep) => [
    scaleSteps(scaleStep),
    scaleSteps(scaleStep + 2),
  ])
  const descending = Range.numeric([topScaleStep + 1, 1]).flatMap(
    (scaleStep) => [scaleSteps(scaleStep), scaleSteps(scaleStep - 2)],
  )

  return [...ascending, ...descending, scaleSteps(0)].map(toPitch)
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
      index === skeleton.length - 1
        ? opts.octaves === 1
          ? "whole"
          : "quarter"
        : "sixteenth"

    currentMeasure.notes.push({ pitch, duration })
    currentDuration += MusicIR.durationInSixteenths(duration)

    if (currentDuration === 16) {
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
    timeSignature: { numerator: 4, denominator: 4 },
    clef: opts.clef,
    measures,
  } satisfies MusicIR.Score
}
