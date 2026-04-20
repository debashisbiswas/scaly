export const KEY_SIGNATURE_OPTIONS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#/Gb",
  "F",
  "Bb",
  "Eb",
  "Ab",
  "Db",
] as const

export const SHARP_KEY_SIGNATURE_OPTIONS = ["G", "D", "A", "E", "B"] as const

export const FLAT_KEY_SIGNATURE_OPTIONS = ["F", "Bb", "Eb", "Ab", "Db"] as const

export const CLEF_OPTIONS = ["Treble Clef", "Bass Clef"] as const

export const MODE_OPTIONS = [
  "Major",
  "Natural Minor",
  "Harmonic Minor",
  "Melodic Minor",
] as const

const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const

export const NOTE_STEP_OPTIONS = (() => {
  const steps: { label: string; vexflowKey: string }[] = []

  for (let octave = 1; octave <= 7; octave += 1) {
    for (const noteName of NOTE_NAMES) {
      if (octave === 1 && noteName !== "B") {
        continue
      }

      if (octave === 7 && noteName !== "C") {
        continue
      }

      steps.push({
        label: `${noteName}${octave}`,
        vexflowKey: `${noteName.toLowerCase()}/${octave}`,
      })
    }
  }

  return steps
})()

export const CLEF_RANGE_CONFIG = {
  "Treble Clef": {
    staffClef: "treble",
    minPitch: "C3",
    maxPitch: "C7",
    minStepLabel: "C3",
    maxStepLabel: "C7",
    defaultLow: "G3",
    defaultHigh: "E5",
  },
  "Bass Clef": {
    staffClef: "bass",
    minPitch: "Bb1",
    maxPitch: "G4",
    minStepLabel: "B1",
    maxStepLabel: "G4",
    defaultLow: "Bb1",
    defaultHigh: "G4",
  },
} as const

export function getClefRangeConfig(clef: (typeof CLEF_OPTIONS)[number] | null) {
  if (clef === "Bass Clef") {
    return CLEF_RANGE_CONFIG["Bass Clef"]
  }

  return CLEF_RANGE_CONFIG["Treble Clef"]
}

export const MIN_BPM = 40
export const MAX_BPM = 200
export const DEFAULT_SINGLE_BPM = 96
