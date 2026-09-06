import { FlowDraft } from "@/core/flows/flow-draft"
import { describe, expect, it } from "vitest"

function createValidDraft(
  overrides: Partial<FlowDraft.Shape> = {},
): FlowDraft.Shape {
  return {
    ...FlowDraft.createEmpty(),
    keys: ["C"],
    clef: "Treble Clef",
    modes: ["Major"],
    ...overrides,
  }
}

describe("FlowDraft", () => {
  describe("normalize", () => {
    it("removes duplicate keys and modes while preserving their order", () => {
      const draft = createValidDraft({
        keys: ["G", "C", "G", "C"],
        modes: ["Natural Minor", "Major", "Natural Minor"],
      })

      const actual = FlowDraft.normalize(draft)

      expect(actual.keys).toEqual(["G", "C"])
      expect(actual.modes).toEqual(["Natural Minor", "Major"])
    })

    it("does not mutate the input draft", () => {
      const draft = createValidDraft({
        keys: ["C", "C"],
        modes: ["Major", "Major"],
      })

      FlowDraft.normalize(draft)

      expect(draft.keys).toEqual(["C", "C"])
      expect(draft.modes).toEqual(["Major", "Major"])
    })
  })

  describe("validate", () => {
    it("accepts a valid draft", () => {
      expect(FlowDraft.validate(createValidDraft())).toEqual([])
    })

    it("reports all missing selections", () => {
      expect(FlowDraft.validate(FlowDraft.createEmpty())).toEqual([
        "missing_keys",
        "missing_clef",
        "missing_modes",
      ])
    })

    it.each([
      [{ low: "not-a-pitch", high: "E5" }, "Treble Clef"],
      [{ low: "G3", high: "not-a-pitch" }, "Treble Clef"],
      [{ low: "E5", high: "G3" }, "Treble Clef"],
      [{ low: "B2", high: "E5" }, "Treble Clef"],
      [{ low: "G3", high: "D7" }, "Treble Clef"],
      [{ low: "A1", high: "G4" }, "Bass Clef"],
      [{ low: "Bb1", high: "A4" }, "Bass Clef"],
    ] as const)("rejects the range %o for %s", (range, clef) => {
      expect(
        FlowDraft.validate(createValidDraft({ range: { ...range }, clef })),
      ).toContain("invalid_range")
    })

    it.each([
      [{ low: "C3", high: "C7" }, "Treble Clef"],
      [{ low: "Bb1", high: "G4" }, "Bass Clef"],
      [{ low: "C4", high: "C4" }, "Treble Clef"],
    ] as const)("accepts the range %o for %s", (range, clef) => {
      expect(
        FlowDraft.validate(createValidDraft({ range: { ...range }, clef })),
      ).not.toContain("invalid_range")
    })

    it.each([39, 209])("rejects a single tempo of %i BPM", (bpm) => {
      expect(
        FlowDraft.validate(
          createValidDraft({ tempo: { kind: "single", bpm } }),
        ),
      ).toContain("invalid_tempo")
    })

    it.each([40, 208])("accepts a single tempo of %i BPM", (bpm) => {
      expect(
        FlowDraft.validate(
          createValidDraft({ tempo: { kind: "single", bpm } }),
        ),
      ).not.toContain("invalid_tempo")
    })

    it.each([
      { minBpm: 39, maxBpm: 100 },
      { minBpm: 100, maxBpm: 209 },
      { minBpm: 101, maxBpm: 100 },
    ])("rejects the tempo range $minBpm-$maxBpm BPM", (tempo) => {
      expect(
        FlowDraft.validate(
          createValidDraft({ tempo: { kind: "range", ...tempo } }),
        ),
      ).toContain("invalid_tempo")
    })

    it.each([
      { minBpm: 40, maxBpm: 208 },
      { minBpm: 96, maxBpm: 96 },
    ])("accepts the tempo range $minBpm-$maxBpm BPM", (tempo) => {
      expect(
        FlowDraft.validate(
          createValidDraft({ tempo: { kind: "range", ...tempo } }),
        ),
      ).not.toContain("invalid_tempo")
    })
  })
})
