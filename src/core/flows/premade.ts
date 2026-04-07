import { Flow } from "./types"

const PREMADE_TIMESTAMP = "2026-03-16T00:00:00.000Z"

export const PREMADE_FLOWS: Flow[] = [
  {
    id: "flow-1",
    name: "First-year jury 2026",
    progressPercent: 52,
    createdAt: PREMADE_TIMESTAMP,
    updatedAt: PREMADE_TIMESTAMP,
    config: {
      keys: ["C", "G", "F"],
      clef: "Treble Clef",
      range: {
        low: "G3",
        high: "E5",
      },
      modes: ["Major"],
      tempo: { kind: "single", bpm: 96 },
    },
  },
  {
    id: "flow-2",
    name: "Triple-tonguing rhythms",
    progressPercent: 41,
    createdAt: PREMADE_TIMESTAMP,
    updatedAt: PREMADE_TIMESTAMP,
    config: {
      keys: ["C", "D", "Eb", "F", "G", "A", "Bb"],
      clef: "Treble Clef",
      range: {
        low: "G3",
        high: "E5",
      },
      modes: ["Major"],
      tempo: { kind: "range", minBpm: 88, maxBpm: 132 },
    },
  },
  {
    id: "flow-3",
    name: "All sharps",
    progressPercent: 76,
    createdAt: PREMADE_TIMESTAMP,
    updatedAt: PREMADE_TIMESTAMP,
    config: {
      keys: ["G", "D", "A", "E", "B", "F#/Gb"],
      clef: "Treble Clef",
      range: {
        low: "G3",
        high: "E5",
      },
      modes: ["Major", "Melodic Minor"],
      tempo: { kind: "single", bpm: 112 },
    },
  },
  {
    id: "flow-4",
    name: "Third-octave scales",
    progressPercent: 29,
    createdAt: PREMADE_TIMESTAMP,
    updatedAt: PREMADE_TIMESTAMP,
    config: {
      keys: ["C", "D", "E", "F", "G", "A", "B"],
      clef: "Treble Clef",
      range: {
        low: "C5",
        high: "C7",
      },
      modes: ["Major", "Harmonic Minor"],
      tempo: { kind: "range", minBpm: 72, maxBpm: 108 },
    },
  },
]
