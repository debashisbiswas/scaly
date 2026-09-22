import { MusicIR } from "../musicir"
import { Mode, getKeyWithMode } from "../modes"

import { Chord, Note, Range } from "tonal"

export const getArpeggioSkeleton = (opts: {
  key: string
  startOctave: number
  octaves: number
  mode: string
}): MusicIR.Pitch[] => {
  if (opts.startOctave < 1) {
    throw new Error(
      `Start octave must be at least 1, received: ${opts.startOctave}`,
    )
  }

  if (opts.octaves < 1) {
    throw new Error(`Octaves must be at least 1, received: ${opts.octaves}`)
  }

  const baseNotes = Range.numeric([0, 3 * opts.octaves])
    .map(Chord.steps(opts.mode, `${opts.key}${opts.startOctave}`))
    .map(Note.get)
    .map((note) => ({
      step: note.letter as MusicIR.Step,
      accidental: note.alt || undefined, // 0 -> undefined
      octave: note.oct ?? 1,
    }))

  const ascending = baseNotes
  const descending = baseNotes.toReversed().slice(1) // remove the tonic at the top

  const allNotes = [...ascending, ...descending]
  return allNotes
}

export const generateArpeggio = (opts: {
  key: string
  octaves: number
  startOctave: number
  clef: "treble" | "bass"
  mode: Mode
}) => {
  if (opts.startOctave < 1) {
    throw new Error(
      `Start octave must be at least 1; received: ${opts.startOctave}`,
    )
  }

  if (opts.octaves < 1) {
    throw new Error(`Octaves must be at least 1; received: ${opts.octaves}`)
  }

  const skeleton = getArpeggioSkeleton(opts)
  const commonScoreConfig = {
    keySignature: { fifths: getKeyWithMode(opts.key, opts.mode).alteration },
    clef: opts.clef,
  }

  if (opts.octaves === 1) {
    const measures: MusicIR.Measure[] = []
    const measure: MusicIR.Measure = { notes: [] }

    for (let i = 0; i < skeleton.length; i++) {
      const note = skeleton[i]
      measure.notes.push({
        pitch: note,
        duration: i !== skeleton.length - 1 ? "sixteenth" : "eighth",
      })
    }

    measures.push(measure)

    if (measures.length > 0) {
      measures[measures.length - 1].finalBarline = true
    }

    return {
      ...commonScoreConfig,
      timeSignature: { numerator: 2, denominator: 4 },
      measures,
    } satisfies MusicIR.Score
  } else if (opts.octaves === 2) {
    const measures: MusicIR.Measure[] = []
    const measure: MusicIR.Measure = { notes: [] }

    for (let i = 0; i < skeleton.length; i++) {
      const note = skeleton[i]
      measure.notes.push({
        pitch: note,
        duration: i !== skeleton.length - 1 ? "sixteenth" : "quarter",
      })
    }

    measures.push(measure)

    if (measures.length > 0) {
      measures[measures.length - 1].finalBarline = true
    }

    return {
      ...commonScoreConfig,
      timeSignature: { numerator: 4, denominator: 4 },
      measures,
    } satisfies MusicIR.Score
  } else if (opts.octaves === 3) {
    const measures: MusicIR.Measure[] = []
    const measure: MusicIR.Measure = { notes: [] }

    for (let i = 0; i < skeleton.length; i++) {
      const note = skeleton[i]
      measure.notes.push({
        pitch: note,
        duration: i !== skeleton.length - 1 ? "sixteenth" : "eighth",
      })
    }

    measures.push(measure)

    if (measures.length > 0) {
      measures[measures.length - 1].finalBarline = true
    }

    return {
      ...commonScoreConfig,
      timeSignature: { numerator: 5, denominator: 4 },
      measures,
    } satisfies MusicIR.Score
  } else {
    throw new Error(`Unsupported arpeggio octave count: ${opts.octaves}`)
  }
}
