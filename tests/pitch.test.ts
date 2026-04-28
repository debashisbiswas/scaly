import { Pitch } from "@/core/flows/Pitch"
import { describe, expect, it } from "vitest"

describe("Pitch", () => {
  describe("nextAvailablePitch", () => {
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

    it("same note name, different accidental", () => {
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
  })

  describe("midi", () => {
    it("midi", () => {
      const actual = Pitch.midi({ note: { name: "B" }, octave: 2 })
      expect(actual).toEqual(47)
    })

    it("midi with accidentals", () => {
      const flat = Pitch.midi({ note: { name: "B", alter: "flat" }, octave: 1 })
      const sharp = Pitch.midi({
        note: { name: "C", alter: "sharp" },
        octave: 4,
      })

      expect(flat).toEqual(34)
      expect(sharp).toEqual(61)
    })
  })

  describe("fromLabel", () => {
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

  describe("availableOctaves", () => {
    it("handles available octaves: zero", () => {
      const actual = Pitch.availableOctaves(
        { note: { name: "C" }, octave: 4 },
        { note: { name: "D" }, octave: 4 },
      )
      expect(actual).toBe(0)
    })

    it("handles one octave", () => {
      const actual = Pitch.availableOctaves(
        { note: { name: "C" }, octave: 4 },
        { note: { name: "C" }, octave: 5 },
      )
      expect(actual).toBe(1)
    })

    it("handles multiple octaves", () => {
      const actual = Pitch.availableOctaves(
        { note: { name: "A" }, octave: 3 },
        { note: { name: "C" }, octave: 6 },
      )
      expect(actual).toBe(2)
    })

    it("handles enharmonic notes", () => {
      const actual = Pitch.availableOctaves(
        { note: { name: "F", alter: "sharp" }, octave: 2 },
        { note: { name: "G", alter: "flat" }, octave: 4 },
      )
      expect(actual).toBe(2)
    })
  })
})
