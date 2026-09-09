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
      ...FlowDraft.createEmpty(),
      keys: ["C"],
      clef: "Treble Clef",
      range: { low: "C4", high: "C6" },
      modes: ["Minor Thirds", "Major", "Major Arpeggio"],
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
})
