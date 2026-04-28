import { Note } from "./Note"
import { Note as TonalNote } from "tonal"

export namespace Pitch {
  export type Shape = {
    note: Note.Shape
    octave: number
  }

  export function midi(pitch: Pitch.Shape) {
    const parts = [Note.fullName(pitch.note), pitch.octave.toString()]
    return TonalNote.get(parts.join("")).midi ?? 0
  }

  export function fromLabel(label: string): Pitch.Shape | null {
    const match = label.match(/^([A-G])([#b]?)(\d+)$/)

    if (!match) {
      return null
    }

    const note = Note.fromLabel(`${match[1]}${match[2]}`)

    if (!note) {
      return null
    }

    return {
      note,
      octave: Number(match[3]),
    }
  }

  export function nextAvailablePitch(
    from: Pitch.Shape,
    target: Note.Shape,
  ): Pitch.Shape {
    return {
      note: target,
      octave:
        Note.pitchClass(target) >= Note.pitchClass(from.note)
          ? from.octave
          : from.octave + 1,
    }
  }

  export function availableOctaves(low: Pitch.Shape, high: Pitch.Shape) {
    const semitoneSpan = Pitch.midi(high) - Pitch.midi(low)
    return Math.floor(semitoneSpan / 12)
  }
}
