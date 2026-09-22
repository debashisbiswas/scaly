import { Note, Scale, Range } from "tonal"

import { MusicIR } from "../musicir"
import { Mode, getKeyWithMode } from "../modes"

type SlurPattern =
  // twos
  | "slur two tongue two"
  | "tongue two slur two"
  | "slur two slur two"
  | "tongue one slur two tongue one"

  // threes
  | "tongue one slur three"
  | "slur three tongue one"

  // fours
  | "tongued"
  | "slur four"

type RhythmPattern = "long octave" | "sixteenths" | "eighth two sixteenths"

const getNotesForScale = (
  key: string,
  mode: Mode,
  startOctave: number,
  octaves: number,
  overshootOctave = false,
) => {
  const fullName = `${key}${startOctave} ${mode}`
  const scaleSteps = Scale.steps(fullName)

  const startNote = 0
  const endNote = 7 * octaves + (overshootOctave ? 1 : 0)

  // Ascending notes include the octave, so remove it when descending.
  const ascendingNotes = Range.numeric([startNote, endNote]).map(scaleSteps)
  const descendingNotes =
    mode === "melodic minor"
      ? Range.numeric([endNote, startNote])
          .map(Scale.steps(`${key}${startOctave} minor`))
          .slice(1)
      : ascendingNotes.toReversed().slice(1)

  return ascendingNotes
    .concat(descendingNotes)
    .filter((note) => note != null)
    .map(Note.get)
}

const applyRhythmPattern = (
  notes: ReturnType<typeof Note.get>[],
  pattern: RhythmPattern,
) => {
  const result: {
    note: ReturnType<typeof Note.get>
    duration: MusicIR.Duration
  }[] = []

  for (const [i, note] of notes.entries()) {
    const duration = (() => {
      if (pattern === "long octave") {
        if (i % 7 === 0) {
          return "eighth"
        } else {
          return "sixteenth"
        }
      } else if (pattern === "sixteenths") {
        return "sixteenth"
      } else if (pattern === "eighth two sixteenths") {
        if (i % 3 === 0) {
          return "eighth"
        } else {
          return "sixteenth"
        }
      } else {
        const _never: never = pattern
        throw new Error(`Unexpected rhythm pattern: ${_never}`)
      }
    })()

    result.push({ note, duration })
  }

  return result
}

function getSlurType(
  slurPattern: SlurPattern,
  timeAccumulator: number,
): MusicIR.Note["slur"] {
  const currentSixteenth = timeAccumulator % 4

  switch (slurPattern) {
    case "slur two tongue two":
      if (currentSixteenth === 0) return "start"
      if (currentSixteenth === 1) return "stop"
      break

    case "tongue two slur two":
      if (currentSixteenth === 2) return "start"
      if (currentSixteenth === 3) return "stop"
      break

    case "slur two slur two":
      if (currentSixteenth === 0 || currentSixteenth === 2) return "start"
      if (currentSixteenth === 1 || currentSixteenth === 3) return "stop"
      break

    case "tongue one slur two tongue one":
      if (currentSixteenth === 1) return "start"
      if (currentSixteenth === 2) return "stop"
      break

    case "slur three tongue one":
      if (currentSixteenth === 0) return "start"
      if (currentSixteenth === 2) return "stop"
      break

    case "tongue one slur three":
      if (currentSixteenth === 1) return "start"
      if (currentSixteenth === 3) return "stop"
      break

    case "slur four":
      if (currentSixteenth === 0) return "start"
      if (currentSixteenth === 3) return "stop"
      break

    case "tongued":
      break

    default:
      const _never: never = slurPattern
      throw new Error(`Unexpected slur pattern: ${_never}`)
  }
}

function toPitch(note: ReturnType<typeof Note.get>): MusicIR.Pitch {
  if (!MusicIR.isStep(note.letter)) {
    throw new Error(`Unexpected note step: ${note.letter}`)
  }

  return {
    step: note.letter,
    accidental: note.alt || undefined, // 0 -> undefined
    octave: note.oct ?? 4,
  }
}

export function generateScaleNotation(opts: {
  key: string
  mode: Mode
  rhythm: RhythmPattern
  slurPattern: SlurPattern
  octaves: number
  startOctave: number
  clef: "treble" | "bass"
}) {
  const notes = getNotesForScale(
    opts.key,
    opts.mode,
    opts.startOctave,
    opts.octaves,
    opts.rhythm === "sixteenths" ||
      (opts.rhythm === "eighth two sixteenths" && opts.octaves === 1),
  )
  const notesWithRhythm = applyRhythmPattern(notes, opts.rhythm)

  const measures: MusicIR.Measure[] = []
  let currentMeasure: MusicIR.Measure = { notes: [] }
  let timeAccumulator = 0

  const timeSignatureTop = (() => {
    if (opts.rhythm === "eighth two sixteenths") {
      if (opts.octaves === 1) {
        return 6
      } else if (opts.octaves === 2) {
        return 5
      } else if (opts.octaves === 3) {
        return 7
      }
    }
    return 4
  })()

  const timeSignature = {
    numerator: timeSignatureTop,
    denominator: 4,
  }

  const measureDuration =
    timeSignature.numerator * (16 / timeSignature.denominator)

  for (const currentNote of notesWithRhythm) {
    const newNote = {
      pitch: toPitch(currentNote.note),
      duration: currentNote.duration,
    }

    currentMeasure.notes.push(newNote)

    timeAccumulator += MusicIR.durationInSixteenths(currentNote.duration)

    if (timeAccumulator >= measureDuration) {
      measures.push(currentMeasure)
      currentMeasure = { notes: [] }
      timeAccumulator = 0
    }
  }

  if (currentMeasure.notes.length > 0) {
    const remainingDuration =
      measureDuration - MusicIR.measureDurationInSixteenths(currentMeasure)

    if (remainingDuration === 3) {
      // 1 3 5 3 1
      const tonic = currentMeasure.notes[currentMeasure.notes.length - 1]
      const third = Note.get(
        Note.transpose(
          `${tonic.pitch.step}${tonic.pitch.octave}`,
          `3${getDescendingThirdModeLetter(opts.mode)}`,
        ),
      )
      const fifth = Note.get(
        Note.transpose(`${tonic.pitch.step}${tonic.pitch.octave}`, "5P"),
      )

      currentMeasure.notes.push({
        pitch: toPitch(third),
        duration: "sixteenth",
      })

      currentMeasure.notes.push({
        pitch: toPitch(fifth),
        duration: "sixteenth",
      })

      currentMeasure.notes.push({
        pitch: toPitch(third),
        duration: "sixteenth",
      })

      measures.push(currentMeasure)
      // land on whole note tonic
      measures.push({
        notes: [{ ...tonic, duration: "whole" }],
      })
    } else if (remainingDuration === 1) {
      const tonic = currentMeasure.notes[currentMeasure.notes.length - 1]
      const fifth = Note.get(
        Note.transpose(`${tonic.pitch.step}${tonic.pitch.octave}`, "5P"),
      )

      currentMeasure.notes.push({
        pitch: toPitch(fifth),
        duration: "sixteenth",
      })

      measures.push(currentMeasure)
      // land on whole note tonic
      measures.push({
        notes: [{ ...tonic, duration: "whole" }],
      })
    } else if (currentMeasure.notes.length === 1) {
      // Extend the last note
      const lastNote = currentMeasure.notes[0]
      lastNote.duration = "whole"
      measures.push(currentMeasure)
    } else if (currentMeasure.notes.length > 2) {
      // if the last note is longer than the (worst case: eighth) we would have landed on...
      const tonic = currentMeasure.notes[currentMeasure.notes.length - 1]

      // pad out the last measure
      while (
        MusicIR.measureDurationInSixteenths(currentMeasure) < measureDuration
      ) {
        currentMeasure.notes.push({
          ...tonic,
          duration: "sixteenth",
        })
      }

      measures.push(currentMeasure)
      // land on whole note tonic
      measures.push({
        notes: [{ ...tonic, duration: "whole" }],
      })
    }
  }

  for (const measure of measures) {
    let timeAccumulator = 0
    for (const note of measure.notes) {
      if (note.duration !== "whole") {
        const slur = getSlurType(opts.slurPattern, timeAccumulator)
        note.slur = slur
      }

      timeAccumulator += MusicIR.durationInSixteenths(note.duration)
    }
  }

  if (measures.length > 0) {
    measures[measures.length - 1].finalBarline = true
  }

  return {
    keySignature: { fifths: getKeyWithMode(opts.key, opts.mode).alteration },
    timeSignature,
    clef: opts.clef,
    measures,
  } satisfies MusicIR.Score
}

const getDescendingThirdModeLetter = (mode: Mode) => {
  if (mode === "major") {
    return "M"
  } else if (
    mode === "minor" ||
    mode === "harmonic minor" ||
    mode === "melodic minor"
  ) {
    return "m"
  } else {
    const _never: never = mode
    throw new Error(`Unexpected mode: ${_never}`)
  }
}
