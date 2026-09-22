import { describe, expect, test } from "vitest"
import {
  generateArpeggio,
  generateScaleNotation,
  getArpeggioSkeleton,
} from "./Scales"

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

describe("Music IR", () => {
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

  test("generates C major arpgeggio, one octave", () => {
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

  test("generates G major arpgeggio, one octave", () => {
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

  test("generates F minor arpgeggio, one octave", () => {
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

  test("arpeggio skeleton", () => {
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

  test("arpeggio skeleton, minor", () => {
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

  test("arpeggio skeleton, two octaves", () => {
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

  test("generates C major arpgeggio, two octaves", () => {
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

  test("generates C major arpgeggio, three octaves", () => {
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
