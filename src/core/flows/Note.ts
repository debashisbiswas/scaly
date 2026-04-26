import { Note as TonalNote } from "tonal"

export namespace Note {
  type NoteName = "A" | "B" | "C" | "D" | "E" | "F" | "G"

  export type Shape = {
    name: NoteName
    alter?: "sharp" | "flat"
  }

  function toAlter(accidental: string) {
    if (accidental === "#") {
      return "sharp" as const
    }

    if (accidental === "b") {
      return "flat" as const
    }

    return undefined
  }

  export function fromLabel(label: string): Note.Shape | null {
    const match = label.match(/^([A-G])([#b]?)$/)

    if (!match) {
      return null
    }

    return {
      name: match[1] as NoteName,
      alter: toAlter(match[2]),
    }
  }

  export function fromKeySignature(key: string): Note.Shape | null {
    return fromLabel(key.split("/")[0])
  }

  export function pitchClass(note: Note.Shape) {
    let pitchClass

    switch (note.name) {
      case "C":
        pitchClass = 0
        break
      case "D":
        pitchClass = 2
        break
      case "E":
        pitchClass = 4
        break
      case "F":
        pitchClass = 5
        break
      case "G":
        pitchClass = 7
        break
      case "A":
        pitchClass = 9
        break
      case "B":
        pitchClass = 11
        break
    }

    if (note.alter === "sharp") {
      pitchClass++
    } else if (note.alter === "flat") {
      pitchClass--
    }

    pitchClass %= 12

    return pitchClass
  }

  export function fullName(note: Note.Shape) {
    return note.name + (note.alter ? note.alter : "")
  }
}

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
}
