import { MODE_OPTIONS } from "@/core/flows/exerciseCatalog"
import { FlowDraft } from "@/core/flows/flow-draft"
import { toExerciseKey } from "@/core/flows/exerciseKey"
import {
  GeneratedExerciseSpec,
  expandFlowDraftToExerciseSpecs,
} from "@/core/flows/service"
import { describe, expect, it } from "vitest"

describe("exercise generation", () => {
  it("generates queue entries for scales, arpeggios, and thirds", () => {
    const draft: FlowDraft.Shape = {
      keys: ["C"],
      clef: "Treble Clef",
      range: { low: "C4", high: "C6" },
      modes: ["Minor Thirds", "Major", "Major Arpeggio"],
      tempo: { kind: "single", bpm: 60 },
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)

    expect(generated.map((exercise) => exercise.mode)).toEqual([
      "major",
      "major arpeggio",
      "minor thirds",
    ])
  })

  it("keeps the existing scale exercise key format", () => {
    const spec: GeneratedExerciseSpec = {
      key: "C",
      mode: "major",
      startOctave: 4,
      octaves: 2,
      clef: "treble",
      tempo: { kind: "single", bpm: 96 },
    }

    expect(toExerciseKey(spec)).toBe(
      "k=C|m=major|so=4|o=2|c=treble|t=single:96",
    )
  })

  it("does not generate keys with too many accidentals", () => {
    const draft: FlowDraft.Shape = {
      keys: ["Db"],
      clef: "Treble Clef",
      range: { low: "Db4", high: "Db5" },
      modes: ["Natural Minor"],
      tempo: { kind: "single", bpm: 60 },
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)
    expect(generated).toHaveLength(0)
  })

  it("skips unreasonable minor keys across all exercise families", () => {
    const draft: FlowDraft.Shape = {
      keys: ["Db"],
      clef: "Treble Clef",
      range: { low: "Db4", high: "Db5" },
      modes: [...MODE_OPTIONS],
      tempo: { kind: "single", bpm: 60 },
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)

    expect(generated.map((exercise) => exercise.mode)).toEqual([
      "major",
      "major arpeggio",
      "major thirds",
    ])
  })

  it("allows minor keys with exactly seven flats across all exercise families", () => {
    const draft: FlowDraft.Shape = {
      keys: ["Ab"],
      clef: "Treble Clef",
      range: { low: "Ab4", high: "Ab5" },
      modes: [
        "Natural Minor",
        "Harmonic Minor",
        "Melodic Minor",
        "Minor Arpeggio",
        "Minor Thirds",
      ],
      tempo: { kind: "single", bpm: 60 },
    }

    const generated = expandFlowDraftToExerciseSpecs(draft)

    expect(generated.map((exercise) => exercise.mode)).toEqual([
      "minor",
      "harmonic minor",
      "melodic minor",
      "minor arpeggio",
      "minor thirds",
    ])
  })
})
