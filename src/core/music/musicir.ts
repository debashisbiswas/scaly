export namespace MusicIR {
  export type Step = "A" | "B" | "C" | "D" | "E" | "F" | "G"

  export type Duration =
    | "sixteenth"
    | "eighth"
    | "quarter"
    | "half"
    | "whole"

  export type Pitch = {
    step: Step
    accidental?: number
    octave: number
  }

  export type Note = {
    pitch: Pitch
    duration: Duration
    slur?: "start" | "stop"
  }

  export type Measure = {
    notes: Note[]
    finalBarline?: boolean
  }

  export type Score = {
    keySignature: { fifths: number }
    timeSignature: { numerator: number; denominator: number }
    clef: "treble" | "bass"
    measures: Measure[]
  }

  export function durationInSixteenths(duration: Duration) {
    switch (duration) {
      case "sixteenth":
        return 1
      case "eighth":
        return 2
      case "quarter":
        return 4
      case "half":
        return 8
      case "whole":
        return 16
      default: {
        const _never: never = duration
        throw new Error(`Unexpected duration: ${_never}`)
      }
    }
  }

  export function measureDurationInSixteenths(measure: Measure) {
    return measure.notes.reduce(
      (total, note) => total + durationInSixteenths(note.duration),
      0,
    )
  }
}
