import { Note } from "@/core/flows/Note"
import { describe, expect, it } from "vitest"

describe("notes", () => {
  it("natural note", () => {
    const actual = Note.pitchClass({
      name: "G",
    })

    expect(actual).toBe(7)
  })

  it("sharp note", () => {
    const actual = Note.pitchClass({
      name: "C",
      alter: "sharp",
    })

    expect(actual).toBe(1)
  })

  it("flat note", () => {
    const actual = Note.pitchClass({
      name: "B",
      alter: "flat",
    })

    expect(actual).toBe(10)
  })

  it("boundary", () => {
    const actual = Note.pitchClass({
      name: "B",
      alter: "sharp",
    })

    expect(actual).toBe(0)
  })
})
