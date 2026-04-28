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
    // TODO: There's a tension here: we're representing keys as strings,
    // but the six-accidental keys (F#/Gb) are ambiguous, so we're implicitly
    // parsing it into F# here.
    // Fix: don't represent keys as strings.
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
    const accidental =
      note.alter === "sharp" ? "#" : note.alter === "flat" ? "b" : ""

    return `${note.name}${accidental}`
  }
}
