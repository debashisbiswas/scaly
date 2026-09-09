import { ExerciseMode } from "@/core/flows/exerciseCatalog"
import { GeneratedExerciseSpec } from "@/core/flows/service"
import { getExerciseNotation } from "@/core/music/practiceNotation"
import { describe, expect, it } from "vitest"

function createExerciseSpec(mode: ExerciseMode): GeneratedExerciseSpec {
  return {
    key: "C",
    mode,
    startOctave: 4,
    octaves: 1,
    clef: "treble",
    tempo: { kind: "single", bpm: 96 },
  }
}

describe("practice notation", () => {
  it("uses the scale renderer for existing scale exercises", () => {
    const notation = getExerciseNotation(createExerciseSpec("major"))

    expect(notation.status).toBe("ready")
    if (notation.status === "ready") {
      expect(notation.musicXML).not.toBeNull()
    }
  })

  it.each([
    "major arpeggio",
    "minor arpeggio",
    "major thirds",
    "minor thirds",
  ] as const)("reports %s notation as unsupported", (mode) => {
    expect(getExerciseNotation(createExerciseSpec(mode))).toEqual({
      status: "unsupported",
    })
  })
})
