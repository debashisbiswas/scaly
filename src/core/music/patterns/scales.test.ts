import { describe, expect, test } from "vitest"
import { generateScaleNotation } from "./scales"

function generateScale(
  overrides: Partial<Parameters<typeof generateScaleNotation>[0]> = {},
) {
  return generateScaleNotation({
    key: "C",
    mode: "major",
    rhythm: "long octave",
    slurPattern: "tongued",
    octaves: 1,
    startOctave: 4,
    clef: "treble",
    ...overrides,
  })
}

function pitchNames(score: ReturnType<typeof generateScaleNotation>) {
  return score.measures.flatMap((measure) =>
    measure.notes.map(({ pitch }) => {
      const accidental =
        pitch.accidental === 1 ? "#" : pitch.accidental === -1 ? "b" : ""

      return `${pitch.step}${accidental}${pitch.octave}`
    }),
  )
}

describe("scales", () => {
  test("generates a C major scale", () => {
    const score = generateScale()

    expect(score).toEqual({
      keySignature: { fifths: 0 },
      timeSignature: { numerator: 4, denominator: 4 },
      clef: "treble",
      measures: [
        {
          notes: [
            { pitch: { step: "C", octave: 4 }, duration: "eighth" },
            { pitch: { step: "D", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "F", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "A", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "B", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "C", octave: 5 }, duration: "eighth" },
            { pitch: { step: "B", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "A", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "G", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "F", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "E", octave: 4 }, duration: "sixteenth" },
            { pitch: { step: "D", octave: 4 }, duration: "sixteenth" },
          ],
        },
        {
          notes: [{ pitch: { step: "C", octave: 4 }, duration: "whole" }],
          finalBarline: true,
        },
      ],
    })
  })

  test.each([
    {
      mode: "minor" as const,
      notes: [
        "A4",
        "B4",
        "C5",
        "D5",
        "E5",
        "F5",
        "G5",
        "A5",
        "G5",
        "F5",
        "E5",
        "D5",
        "C5",
        "B4",
        "A4",
      ],
    },
    {
      mode: "harmonic minor" as const,
      notes: [
        "A4",
        "B4",
        "C5",
        "D5",
        "E5",
        "F5",
        "G#5",
        "A5",
        "G#5",
        "F5",
        "E5",
        "D5",
        "C5",
        "B4",
        "A4",
      ],
    },
    {
      mode: "melodic minor" as const,
      notes: [
        "A4",
        "B4",
        "C5",
        "D5",
        "E5",
        "F#5",
        "G#5",
        "A5",
        "G5",
        "F5",
        "E5",
        "D5",
        "C5",
        "B4",
        "A4",
      ],
    },
  ])("generates $mode pitches", ({ mode, notes }) => {
    const score = generateScale({ key: "A", mode })

    expect(pitchNames(score)).toEqual(notes)
  })

  test.each([
    {
      rhythm: "long octave" as const,
      durations: ["eighth", "sixteenth", "sixteenth", "sixteenth"],
    },
    {
      rhythm: "sixteenths" as const,
      durations: ["sixteenth", "sixteenth", "sixteenth", "sixteenth"],
    },
    {
      rhythm: "eighth two sixteenths" as const,
      durations: ["eighth", "sixteenth", "sixteenth", "eighth"],
    },
  ])("applies the $rhythm rhythm", ({ rhythm, durations }) => {
    const score = generateScale({ rhythm })

    expect(
      score.measures[0].notes.slice(0, 4).map((note) => note.duration),
    ).toEqual(durations)
  })

  test("applies slurs using notation concepts", () => {
    const score = generateScale({
      rhythm: "sixteenths",
      slurPattern: "slur two tongue two",
    })

    expect(
      score.measures[0].notes.slice(0, 4).map((note) => note.slur),
    ).toEqual(["start", "stop", undefined, undefined])
  })
})
