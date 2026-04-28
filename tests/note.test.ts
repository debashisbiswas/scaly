import { Note } from "@/core/flows/Note"
import { describe, expect, it } from "vitest"

describe("Note", () => {
  describe("pitchClass", () => {
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

  describe("fromLabel", () => {
    it("parses a natural note label", () => {
      const actual = Note.fromLabel("F")
      expect(actual).toEqual({ name: "F" })
    })

    it("parses a sharp note label", () => {
      const actual = Note.fromLabel("C#")
      expect(actual).toEqual({ name: "C", alter: "sharp" })
    })
  })

  describe("fromKeySignature", () => {
    it("parses a slash key signature as first spelling", () => {
      const actual = Note.fromKeySignature("F#/Gb")
      expect(actual).toEqual({ name: "F", alter: "sharp" })
    })

    it("returns null for invalid key signature", () => {
      const actual = Note.fromKeySignature("H")
      expect(actual).toBeNull()
    })
  })
})
