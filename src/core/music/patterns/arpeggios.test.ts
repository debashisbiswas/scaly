import { describe, expect, test } from "vitest"
import { getArpeggioSkeleton, generateArpeggio } from "./arpeggios"

describe("arpeggios", () => {
  describe("skeletons", () => {
    test("C major, happy path", () => {
      const skeleton = getArpeggioSkeleton({
        key: "C",
        octaves: 1,
        startOctave: 4,
        mode: "major",
      })

      expect(skeleton).toEqual([
        {
          step: "C",
          octave: 4,
        },
        {
          step: "E",
          octave: 4,
        },
        {
          step: "G",
          octave: 4,
        },
        {
          step: "C",
          octave: 5,
        },
        {
          step: "G",
          octave: 4,
        },
        {
          step: "E",
          octave: 4,
        },
        {
          step: "C",
          octave: 4,
        },
      ])
    })

    test("minor", () => {
      const skeleton = getArpeggioSkeleton({
        key: "F",
        octaves: 1,
        startOctave: 4,
        mode: "minor",
      })

      expect(skeleton).toEqual([
        {
          step: "F",
          octave: 4,
        },
        {
          step: "A",
          accidental: -1,
          octave: 4,
        },
        {
          step: "C",
          octave: 5,
        },
        {
          step: "F",
          octave: 5,
        },
        {
          step: "C",
          octave: 5,
        },
        {
          step: "A",
          accidental: -1,
          octave: 4,
        },
        {
          step: "F",
          octave: 4,
        },
      ])
    })

    test("two octaves", () => {
      const skeleton = getArpeggioSkeleton({
        key: "C",
        octaves: 2,
        startOctave: 4,
        mode: "major",
      })

      expect(skeleton).toEqual([
        {
          step: "C",
          octave: 4,
        },
        {
          step: "E",
          octave: 4,
        },
        {
          step: "G",
          octave: 4,
        },
        {
          step: "C",
          octave: 5,
        },
        {
          step: "E",
          octave: 5,
        },
        {
          step: "G",
          octave: 5,
        },
        {
          step: "C",
          octave: 6,
        },
        {
          step: "G",
          octave: 5,
        },
        {
          step: "E",
          octave: 5,
        },
        {
          step: "C",
          octave: 5,
        },
        {
          step: "G",
          octave: 4,
        },
        {
          step: "E",
          octave: 4,
        },
        {
          step: "C",
          octave: 4,
        },
      ])
    })
  })

  describe("patterns", () => {
    test("C major arpgeggio, one octave", () => {
      const score = generateArpeggio({
        key: "C",
        startOctave: 4,
        octaves: 1,
        clef: "treble",
        mode: "major",
      })

      expect(score).toEqual({
        keySignature: { fifths: 0 },
        timeSignature: { numerator: 2, denominator: 4 },
        clef: "treble",
        measures: [
          {
            notes: [
              { pitch: { step: "C", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 5 }, duration: "sixteenth" },

              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 4 }, duration: "eighth" },
            ],
            finalBarline: true,
          },
        ],
      })
    })

    test("G major arpgeggio, one octave", () => {
      const score = generateArpeggio({
        key: "G",
        startOctave: 3,
        octaves: 1,
        clef: "treble",
        mode: "major",
      })

      expect(score).toEqual({
        keySignature: { fifths: 1 },
        timeSignature: { numerator: 2, denominator: 4 },
        clef: "treble",
        measures: [
          {
            notes: [
              { pitch: { step: "G", octave: 3 }, duration: "sixteenth" },
              { pitch: { step: "B", octave: 3 }, duration: "sixteenth" },
              { pitch: { step: "D", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },

              { pitch: { step: "D", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "B", octave: 3 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 3 }, duration: "eighth" },
            ],
            finalBarline: true,
          },
        ],
      })
    })

    test("F minor arpgeggio, one octave", () => {
      const score = generateArpeggio({
        key: "F",
        startOctave: 3,
        octaves: 1,
        clef: "bass",
        mode: "minor",
      })

      expect(score).toEqual({
        keySignature: { fifths: -4 },
        timeSignature: { numerator: 2, denominator: 4 },
        clef: "bass",
        measures: [
          {
            notes: [
              { pitch: { step: "F", octave: 3 }, duration: "sixteenth" },
              {
                pitch: { step: "A", accidental: -1, octave: 3 },
                duration: "sixteenth",
              },
              { pitch: { step: "C", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "F", octave: 4 }, duration: "sixteenth" },

              { pitch: { step: "C", octave: 4 }, duration: "sixteenth" },
              {
                pitch: { step: "A", accidental: -1, octave: 3 },
                duration: "sixteenth",
              },
              { pitch: { step: "F", octave: 3 }, duration: "eighth" },
            ],
            finalBarline: true,
          },
        ],
      })
    })

    test("C major arpgeggio, two octaves", () => {
      const score = generateArpeggio({
        key: "C",
        startOctave: 4,
        octaves: 2,
        clef: "treble",
        mode: "major",
      })

      expect(score).toEqual({
        keySignature: { fifths: 0 },
        timeSignature: { numerator: 4, denominator: 4 },
        clef: "treble",
        measures: [
          {
            notes: [
              { pitch: { step: "C", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 5 }, duration: "sixteenth" },

              { pitch: { step: "E", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 6 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 5 }, duration: "sixteenth" },

              { pitch: { step: "E", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },

              { pitch: { step: "C", octave: 4 }, duration: "quarter" },
            ],
            finalBarline: true,
          },
        ],
      })
    })

    test("C major arpgeggio, three octaves", () => {
      const score = generateArpeggio({
        key: "C",
        startOctave: 4,
        octaves: 3,
        clef: "treble",
        mode: "major",
      })

      expect(score).toEqual({
        keySignature: { fifths: 0 },
        timeSignature: { numerator: 5, denominator: 4 },
        clef: "treble",
        measures: [
          {
            notes: [
              { pitch: { step: "C", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 5 }, duration: "sixteenth" },

              { pitch: { step: "E", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 6 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 6 }, duration: "sixteenth" },

              { pitch: { step: "G", octave: 6 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 7 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 6 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 6 }, duration: "sixteenth" },

              { pitch: { step: "C", octave: 6 }, duration: "sixteenth" },
              { pitch: { step: "G", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 5 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 5 }, duration: "sixteenth" },

              { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
              { pitch: { step: "C", octave: 4 }, duration: "eighth" },
            ],
            finalBarline: true,
          },
        ],
      })
    })
  })
})
