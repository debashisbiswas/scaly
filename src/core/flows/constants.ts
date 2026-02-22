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

export const CLEF_OPTIONS = ["Bass Clef", "Treble Clef"] as const

export const MODE_OPTIONS = [
  "Major",
  "Natural Minor",
  "Harmonic Minor",
  "Melodic Minor",
] as const

export const SLUR_PATTERN_OPTIONS = [
  {
    id: "full-phrase",
    slurSpans: [[0, 13]],
  },
  {
    id: "every-beat",
    slurSpans: [
      [0, 2],
      [3, 6],
      [7, 9],
      [10, 13],
    ],
  },
  {
    id: "tongue-1-slur-3",
    slurSpans: [
      [1, 2],
      [4, 6],
      [8, 9],
      [11, 13],
    ],
  },
] as const

const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const

export const NOTE_STEP_OPTIONS = (() => {
  const steps: { label: string; vexflowKey: string }[] = []

  for (let octave = 3; octave <= 7; octave += 1) {
    for (const noteName of NOTE_NAMES) {
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

export const MIN_BPM = 40
export const MAX_BPM = 200
export const DEFAULT_SINGLE_BPM = 96
