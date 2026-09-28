import { ExerciseMode } from "@/core/flows/exerciseCatalog"
import { GeneratedExerciseSpec } from "@/core/flows/service"
import { getExerciseNotation } from "@/core/music/practiceNotation"
import { describe, expect, it } from "vitest"

function createExerciseSpec(
  mode: ExerciseMode,
  overrides: Partial<GeneratedExerciseSpec> = {},
): GeneratedExerciseSpec {
  return {
    key: "C",
    mode,
    startOctave: 4,
    octaves: 1,
    clef: "treble",
    tempo: { kind: "single", bpm: 96 },
    ...overrides,
  }
}

describe("practice notation", () => {
  it("uses the scale renderer for existing scale exercises", () => {
    const notation = getExerciseNotation(createExerciseSpec("major"))

    expect(notation.status).toBe("ready")
    if (notation.status === "ready") {
      expect(notation.score.measures).not.toHaveLength(0)
      expect(notation.score.measures[0].notes[0].pitch).toEqual({
        step: "C",
        octave: 4,
      })
    }
  })

  it("renders major thirds using the generated exercise range", () => {
    const notation = getExerciseNotation(
      createExerciseSpec("major thirds", {
        startOctave: 3,
        octaves: 2,
        clef: "bass",
      }),
    )

    expect(notation.status).toBe("ready")
    if (notation.status === "ready") {
      expect(notation.score.clef).toBe("bass")
      expect(notation.score.measures).toHaveLength(4)
      expect(notation.score.measures[0].notes[0].pitch).toMatchObject({
        step: "C",
        octave: 3,
      })
    }
  })

  it("renders minor thirds as melodic minor ascending and natural minor descending", () => {
    const notation = getExerciseNotation(
      createExerciseSpec("minor thirds", { key: "A" }),
    )

    expect(notation.status).toBe("ready")
    if (notation.status === "ready") {
      const notes = notation.score.measures.flatMap((measure) => measure.notes)

      expect(notes[7].pitch).toMatchObject({
        step: "F",
        accidental: 1,
        octave: 5,
      })
      expect(notes[15].pitch).toMatchObject({
        step: "F",
        accidental: undefined,
        octave: 5,
      })
    }
  })

  it("reports thirds beyond three octaves as unsupported", () => {
    expect(
      getExerciseNotation(createExerciseSpec("major thirds", { octaves: 4 })),
    ).toEqual({ status: "unsupported" })
  })
})
