import { describe, expect, it } from "vitest"

import { toExerciseKey } from "@/core/flows/exerciseKey"
import type { ExerciseSpecIdentity } from "@/core/flows/exerciseKey"

describe("exercise key", () => {
  it("produces the same key for identical specs", () => {
    const spec: ExerciseSpecIdentity = {
      key: "C",
      mode: "major",
      rhythm: "sixteenths",
      slurPattern: "slur four",
      startOctave: 3,
      octaves: 2,
      clef: "treble",
      tempo: { kind: "single", bpm: 96 },
    }

    expect(toExerciseKey(spec)).toBe(toExerciseKey(spec))
  })

  it("changes the key when any identity field changes", () => {
    const base: ExerciseSpecIdentity = {
      key: "C",
      mode: "major",
      rhythm: "sixteenths",
      slurPattern: "slur four",
      startOctave: 3,
      octaves: 2,
      clef: "treble",
      tempo: { kind: "single", bpm: 96 },
    }

    const variants = [
      { ...base, key: "D" },
      { ...base, mode: "minor" as const },
      { ...base, rhythm: "long octave" as const },
      { ...base, slurPattern: "tongued" as const },
      { ...base, startOctave: 4 },
      { ...base, octaves: 3 },
      { ...base, clef: "bass" as const },
      { ...base, tempo: { kind: "single", bpm: 100 } as const },
      { ...base, tempo: { kind: "range", minBpm: 80, maxBpm: 120 } as const },
    ]

    const baseKey = toExerciseKey(base)

    for (const variant of variants) {
      expect(toExerciseKey(variant)).not.toBe(baseKey)
    }
  })

  it("uses stable tempo tokens for single and range tempos", () => {
    const singleKey = toExerciseKey({
      key: "F#",
      mode: "harmonic minor",
      rhythm: "eighth two sixteenths",
      slurPattern: "tongue one slur three",
      startOctave: 4,
      octaves: 1,
      clef: "treble",
      tempo: { kind: "single", bpm: 88 },
    })

    const rangeKey = toExerciseKey({
      key: "F#",
      mode: "harmonic minor",
      rhythm: "eighth two sixteenths",
      slurPattern: "tongue one slur three",
      startOctave: 4,
      octaves: 1,
      clef: "treble",
      tempo: { kind: "range", minBpm: 80, maxBpm: 104 },
    })

    expect(singleKey).toContain("t=single:88")
    expect(rangeKey).toContain("t=range:80-104")
  })
})
