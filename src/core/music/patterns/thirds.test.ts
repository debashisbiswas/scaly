import { describe, expect, test } from "vitest"
import { MusicIR } from "../musicir"
import { generateThirds, getThirdsSkeleton } from "./thirds"

const cMajorTwoOctaves: MusicIR.Pitch[] = [
  { step: "C", octave: 4 },
  { step: "E", octave: 4 },
  { step: "D", octave: 4 },
  { step: "F", octave: 4 },
  { step: "E", octave: 4 },
  { step: "G", octave: 4 },
  { step: "F", octave: 4 },
  { step: "A", octave: 4 },
  { step: "G", octave: 4 },
  { step: "B", octave: 4 },
  { step: "A", octave: 4 },
  { step: "C", octave: 5 },
  { step: "B", octave: 4 },
  { step: "D", octave: 5 },
  { step: "C", octave: 5 },
  { step: "E", octave: 5 },
  { step: "D", octave: 5 },
  { step: "F", octave: 5 },
  { step: "E", octave: 5 },
  { step: "G", octave: 5 },
  { step: "F", octave: 5 },
  { step: "A", octave: 5 },
  { step: "G", octave: 5 },
  { step: "B", octave: 5 },
  { step: "A", octave: 5 },
  { step: "C", octave: 6 },
  { step: "B", octave: 5 },
  { step: "D", octave: 6 },

  { step: "C", octave: 6 },
  { step: "A", octave: 5 },
  { step: "B", octave: 5 },
  { step: "G", octave: 5 },
  { step: "A", octave: 5 },
  { step: "F", octave: 5 },
  { step: "G", octave: 5 },
  { step: "E", octave: 5 },
  { step: "F", octave: 5 },
  { step: "D", octave: 5 },
  { step: "E", octave: 5 },
  { step: "C", octave: 5 },
  { step: "D", octave: 5 },
  { step: "B", octave: 4 },
  { step: "C", octave: 5 },
  { step: "A", octave: 4 },
  { step: "B", octave: 4 },
  { step: "G", octave: 4 },
  { step: "A", octave: 4 },
  { step: "F", octave: 4 },
  { step: "G", octave: 4 },
  { step: "E", octave: 4 },
  { step: "F", octave: 4 },
  { step: "D", octave: 4 },
  { step: "E", octave: 4 },
  { step: "C", octave: 4 },
  { step: "D", octave: 4 },
  { step: "B", octave: 3 },
  { step: "C", octave: 4 },
]

const cMajorOneOctave: MusicIR.Pitch[] = [
  { step: "C", octave: 4 },
  { step: "E", octave: 4 },
  { step: "D", octave: 4 },
  { step: "F", octave: 4 },
  { step: "E", octave: 4 },
  { step: "G", octave: 4 },
  { step: "F", octave: 4 },
  { step: "A", octave: 4 },
  { step: "G", octave: 4 },
  { step: "B", octave: 4 },
  { step: "A", octave: 4 },
  { step: "C", octave: 5 },
  { step: "B", octave: 4 },
  { step: "D", octave: 5 },

  { step: "C", octave: 5 },
  { step: "A", octave: 4 },
  { step: "B", octave: 4 },
  { step: "G", octave: 4 },
  { step: "A", octave: 4 },
  { step: "F", octave: 4 },
  { step: "G", octave: 4 },
  { step: "E", octave: 4 },
  { step: "F", octave: 4 },
  { step: "D", octave: 4 },
  { step: "E", octave: 4 },
  { step: "C", octave: 4 },
  { step: "D", octave: 4 },
  { step: "B", octave: 3 },
  { step: "C", octave: 4 },
]

describe("thirds", () => {
  test("uses melodic minor ascending and natural minor descending", () => {
    const skeleton = getThirdsSkeleton({
      key: "A",
      mode: "minor",
      startOctave: 4,
      octaves: 1,
    })

    expect(skeleton).toEqual([
      { step: "A", octave: 4 },
      { step: "C", octave: 5 },
      { step: "B", octave: 4 },
      { step: "D", octave: 5 },
      { step: "C", octave: 5 },
      { step: "E", octave: 5 },
      { step: "D", octave: 5 },
      { step: "F", accidental: 1, octave: 5 },
      { step: "E", octave: 5 },
      { step: "G", accidental: 1, octave: 5 },
      { step: "F", accidental: 1, octave: 5 },
      { step: "A", octave: 5 },
      { step: "G", accidental: 1, octave: 5 },
      { step: "B", octave: 5 },

      { step: "A", octave: 5 },
      { step: "F", octave: 5 },
      { step: "G", octave: 5 },
      { step: "E", octave: 5 },
      { step: "F", octave: 5 },
      { step: "D", octave: 5 },
      { step: "E", octave: 5 },
      { step: "C", octave: 5 },
      { step: "D", octave: 5 },
      { step: "B", octave: 4 },
      { step: "C", octave: 5 },
      { step: "A", octave: 4 },
      { step: "B", octave: 4 },
      { step: "G", octave: 4 },
      { step: "A", octave: 4 },
    ])
  })

  test("generates a one-octave C major thirds skeleton", () => {
    const skeleton = getThirdsSkeleton({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 1,
    })

    expect(skeleton).toEqual(cMajorOneOctave)
  })

  test("generates the C major thirds skeleton", () => {
    const skeleton = getThirdsSkeleton({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 2,
    })

    expect(skeleton).toEqual(cMajorTwoOctaves)
  })

  test("generates the C major thirds score", () => {
    const score = generateThirds({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 2,
      clef: "treble",
    })

    const sixteenthNote = (pitch: MusicIR.Pitch): MusicIR.Note => ({
      pitch,
      duration: "sixteenth",
    })

    expect(score).toEqual({
      keySignature: { fifths: 0 },
      timeSignature: { numerator: 4, denominator: 4 },
      clef: "treble",
      measures: [
        { notes: cMajorTwoOctaves.slice(0, 16).map(sixteenthNote) },
        { notes: cMajorTwoOctaves.slice(16, 32).map(sixteenthNote) },
        { notes: cMajorTwoOctaves.slice(32, 48).map(sixteenthNote) },
        {
          notes: [
            ...cMajorTwoOctaves.slice(48, 56).map(sixteenthNote),
            { pitch: { step: "C", octave: 4 }, duration: "half" },
          ],
          finalBarline: true,
        },
      ],
    })
  })

  test("lands a one-octave pattern on a quarter-note tonic", () => {
    const score = generateThirds({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 1,
      clef: "treble",
    })

    expect(score.measures).toEqual([
      {
        notes: cMajorOneOctave
          .slice(0, 16)
          .map((pitch) => ({ pitch, duration: "sixteenth" })),
      },
      {
        notes: [
          ...cMajorOneOctave
            .slice(16, 28)
            .map((pitch) => ({ pitch, duration: "sixteenth" })),
          { pitch: { step: "C", octave: 4 }, duration: "quarter" },
        ],
        finalBarline: true,
      },
    ])
  })

  // TODO: does the top of this exercise follow the same pattern as the
  // two-octave pattern?
  test("generates a three-octave pattern without extending past the range", () => {
    const skeleton = getThirdsSkeleton({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 3,
    })
    const score = generateThirds({
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 3,
      clef: "treble",
    })

    expect(skeleton).toHaveLength(85)
    expect(skeleton.slice(38, 46)).toEqual([
      { step: "A", octave: 6 },
      { step: "C", octave: 7 },
      { step: "B", octave: 6 },
      { step: "D", octave: 7 },
      { step: "C", octave: 7 },
      { step: "A", octave: 6 },
      { step: "B", octave: 6 },
      { step: "G", octave: 6 },
    ])
    expect(skeleton.slice(-3)).toEqual([
      { step: "D", octave: 4 },
      { step: "B", octave: 3 },
      { step: "C", octave: 4 },
    ])
    expect(score.timeSignature).toEqual({ numerator: 11, denominator: 4 })
    expect(score.measures).toHaveLength(2)
    expect(score.measures.map(MusicIR.measureDurationInSixteenths)).toEqual([
      44, 44,
    ])
    expect(score.measures.at(-1)?.notes.at(-1)).toEqual({
      pitch: { step: "C", octave: 4 },
      duration: "quarter",
    })
    expect(score.measures.at(-1)?.finalBarline).toBe(true)
  })
})
