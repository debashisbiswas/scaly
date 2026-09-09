import {
  EXERCISE_CATALOG,
  getExerciseDefinitionByMode,
  getExerciseDefinitionBySelection,
} from "@/core/flows/exerciseCatalog"
import { describe, expect, it } from "vitest"

describe("exercise catalog", () => {
  it("preserves the existing scale identifiers", () => {
    expect(
      EXERCISE_CATALOG.slice(0, 4).map(({ selection, mode }) => ({
        selection,
        mode,
      })),
    ).toEqual([
      { selection: "Major", mode: "major" },
      { selection: "Natural Minor", mode: "minor" },
      { selection: "Harmonic Minor", mode: "harmonic minor" },
      { selection: "Melodic Minor", mode: "melodic minor" },
    ])
  })

  it("defines major and minor arpeggios and scales in thirds", () => {
    expect(
      EXERCISE_CATALOG.slice(4).map((exercise) => exercise.pickerLabel),
    ).toEqual([
      "Major Arpeggio",
      "Minor Arpeggio",
      "Major Thirds",
      "Minor Thirds",
    ])
  })

  it("looks up definitions by flow selection and generated mode", () => {
    expect(getExerciseDefinitionBySelection("Major Thirds").mode).toBe(
      "major thirds",
    )
    expect(getExerciseDefinitionByMode("minor arpeggio").selection).toBe(
      "Minor Arpeggio",
    )
  })
})
