import { Pitch } from "@/core/flows/Note"
import { describe, expect, it } from "vitest"

describe("next available pitch", () => {
  it("same octave", () => {
    const actual = Pitch.nextAvailablePitch(
      { note: { name: "C" }, octave: 4 },
      { name: "A" },
    )
    expect(actual).toEqual({ note: { name: "A" }, octave: 4 })
  })

  it("same note", () => {
    const actual = Pitch.nextAvailablePitch(
      { note: { name: "A" }, octave: 4 },
      { name: "A" },
    )
    expect(actual).toEqual({ note: { name: "A" }, octave: 4 })
  })

  it("accidental: same note", () => {
    const actual = Pitch.nextAvailablePitch(
      { note: { name: "C", alter: "sharp" }, octave: 4 },
      { name: "C" },
    )
    expect(actual).toEqual({ note: { name: "C" }, octave: 5 })
  })

  it("accidental: enharmonic note", () => {
    const actual = Pitch.nextAvailablePitch(
      { note: { name: "C", alter: "sharp" }, octave: 4 },
      { name: "C" },
    )
    expect(actual).toEqual({ note: { name: "C" }, octave: 5 })
  })

  it("next octave", () => {
    const actual = Pitch.nextAvailablePitch(
      { note: { name: "G" }, octave: 4 },
      { name: "C" },
    )
    expect(actual).toEqual({ note: { name: "C" }, octave: 5 })
  })

  it("midi", () => {
    const actual = Pitch.midi({ note: { name: "B" }, octave: 2 })
    expect(actual).toEqual(47)
  })

  it("parses a pitch label", () => {
    expect(Pitch.fromLabel("Bb1")).toEqual({
      note: { name: "B", alter: "flat" },
      octave: 1,
    })

    expect(Pitch.fromLabel("A3")).toEqual({
      note: { name: "A" },
      octave: 3,
    })
  })

  it("returns null for invalid pitch label", () => {
    const actual = Pitch.fromLabel("Bb")
    expect(actual).toBeNull()
  })
})
