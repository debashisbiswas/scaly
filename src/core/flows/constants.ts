export const SHARP_KEY_SIGNATURE_OPTIONS = ["G", "D", "A", "E", "B"] as const
export const FLAT_KEY_SIGNATURE_OPTIONS = ["F", "Bb", "Eb", "Ab", "Db"] as const

export const KEY_SIGNATURE_OPTIONS = [
  "C",
  ...SHARP_KEY_SIGNATURE_OPTIONS,
  "F#/Gb",
  ...FLAT_KEY_SIGNATURE_OPTIONS,
] as const

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
export const MAX_BPM = 208
export const DEFAULT_SINGLE_BPM = 96

export const TEMPO_BUCKETS = [
  { minBpm: 40, maxBpm: 41 },
  { minBpm: 42, maxBpm: 43 },
  { minBpm: 44, maxBpm: 45 },
  { minBpm: 46, maxBpm: 47 },
  { minBpm: 48, maxBpm: 49 },
  { minBpm: 50, maxBpm: 51 },
  { minBpm: 52, maxBpm: 53 },
  { minBpm: 54, maxBpm: 55 },
  { minBpm: 56, maxBpm: 57 },
  { minBpm: 58, maxBpm: 59 },
  { minBpm: 60, maxBpm: 62 },
  { minBpm: 63, maxBpm: 65 },
  { minBpm: 66, maxBpm: 68 },
  { minBpm: 69, maxBpm: 71 },
  { minBpm: 72, maxBpm: 75 },
  { minBpm: 76, maxBpm: 79 },
  { minBpm: 80, maxBpm: 83 },
  { minBpm: 84, maxBpm: 87 },
  { minBpm: 88, maxBpm: 91 },
  { minBpm: 92, maxBpm: 95 },
  { minBpm: 96, maxBpm: 99 },
  { minBpm: 100, maxBpm: 103 },
  { minBpm: 104, maxBpm: 107 },
  { minBpm: 108, maxBpm: 111 },
  { minBpm: 112, maxBpm: 115 },
  { minBpm: 116, maxBpm: 119 },
  { minBpm: 120, maxBpm: 125 },
  { minBpm: 126, maxBpm: 131 },
  { minBpm: 132, maxBpm: 137 },
  { minBpm: 138, maxBpm: 143 },
  { minBpm: 144, maxBpm: 151 },
  { minBpm: 152, maxBpm: 159 },
  { minBpm: 160, maxBpm: 167 },
  { minBpm: 168, maxBpm: 175 },
  { minBpm: 176, maxBpm: 183 },
  { minBpm: 184, maxBpm: 191 },
  { minBpm: 192, maxBpm: 199 },
  { minBpm: 200, maxBpm: 207 },
  { minBpm: 208, maxBpm: 208 },
] as const
