export const EXERCISE_CATALOG = [
  {
    selection: "Major",
    mode: "major",
    keyMode: "major",
    pickerLabel: "Major Scale",
    variantLabel: "Major",
    family: "scale",
    familyLabel: "Scale",
  },
  {
    selection: "Natural Minor",
    mode: "minor",
    keyMode: "minor",
    pickerLabel: "Natural Minor Scale",
    variantLabel: "Natural Minor",
    family: "scale",
    familyLabel: "Scale",
  },
  {
    selection: "Harmonic Minor",
    mode: "harmonic minor",
    keyMode: "harmonic minor",
    pickerLabel: "Harmonic Minor Scale",
    variantLabel: "Harmonic Minor",
    family: "scale",
    familyLabel: "Scale",
  },
  {
    selection: "Melodic Minor",
    mode: "melodic minor",
    keyMode: "melodic minor",
    pickerLabel: "Melodic Minor Scale",
    variantLabel: "Melodic Minor",
    family: "scale",
    familyLabel: "Scale",
  },
  {
    selection: "Major Arpeggio",
    mode: "major arpeggio",
    keyMode: "major",
    pickerLabel: "Major Arpeggio",
    variantLabel: "Major",
    family: "arpeggio",
    familyLabel: "Arpeggio",
  },
  {
    selection: "Minor Arpeggio",
    mode: "minor arpeggio",
    keyMode: "minor",
    pickerLabel: "Minor Arpeggio",
    variantLabel: "Minor",
    family: "arpeggio",
    familyLabel: "Arpeggio",
  },
  {
    selection: "Major Thirds",
    mode: "major thirds",
    keyMode: "major",
    pickerLabel: "Major Thirds",
    variantLabel: "Major",
    family: "thirds",
    familyLabel: "Thirds",
  },
  {
    selection: "Minor Thirds",
    mode: "minor thirds",
    keyMode: "minor",
    pickerLabel: "Minor Thirds",
    variantLabel: "Minor",
    family: "thirds",
    familyLabel: "Thirds",
  },
] as const

export type ExerciseSelection = (typeof EXERCISE_CATALOG)[number]["selection"]
export type ExerciseMode = (typeof EXERCISE_CATALOG)[number]["mode"]

export const MODE_OPTIONS: readonly ExerciseSelection[] = EXERCISE_CATALOG.map(
  (exercise) => exercise.selection,
)

export function getExerciseDefinitionBySelection(selection: ExerciseSelection) {
  const definition = EXERCISE_CATALOG.find(
    (exercise) => exercise.selection === selection,
  )

  if (!definition) {
    throw new Error(`Unknown exercise selection: ${selection}`)
  }

  return definition
}

export function getExerciseDefinitionByMode(mode: ExerciseMode) {
  const definition = EXERCISE_CATALOG.find((exercise) => exercise.mode === mode)

  if (!definition) {
    throw new Error(`Unknown exercise mode: ${mode}`)
  }

  return definition
}
