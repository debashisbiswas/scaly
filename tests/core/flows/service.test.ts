import { describe, expect, it } from "vitest"

import { getClefRangeConfig } from "@/core/flows/constants"
import {
  createEmptyFlowDraft,
  expandFlowDraftToExerciseSpecs,
  normalizeFlowDraft,
  validateFlowDraft,
} from "@/core/flows/service"
import { FlowDraft } from "@/core/flows/types"

describe("flow service", () => {
  it("creates an empty draft with expected defaults", () => {
    const draft = createEmptyFlowDraft()

    expect(draft.keys).toEqual([])
    expect(draft.clef).toBeNull()
    expect(draft.modes).toEqual([])
    expect(draft.tempo).toEqual({ kind: "single", bpm: 96 })
    const trebleRange = getClefRangeConfig(null)

    expect(draft.range).toEqual({
      low: trebleRange.defaultLow,
      high: trebleRange.defaultHigh,
    })
  })

  it("validates required draft fields", () => {
    const draft = createEmptyFlowDraft()

    expect(validateFlowDraft(draft)).toEqual([
      "missing_keys",
      "missing_clef",
      "missing_modes",
    ])
  })

  it("normalizes duplicate selections for multi-select fields", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C", "C"],
      clef: "Treble Clef",
      modes: ["Major", "Major"],
    }

    const normalized = normalizeFlowDraft(draft)

    expect(normalized.keys).toEqual(["C"])
    expect(normalized.clef).toBe("Treble Clef")
    expect(normalized.modes).toEqual(["Major"])
  })

  it("accepts accidental pitch labels in range", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Treble Clef",
      modes: ["Major"],
      range: {
        low: "Bb3",
        high: "C#5",
      },
    }

    expect(validateFlowDraft(draft)).toEqual([])
  })

  it("rejects accidental ranges when low is above high", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Treble Clef",
      modes: ["Major"],
      range: {
        low: "C#5",
        high: "Bb3",
      },
    }

    expect(validateFlowDraft(draft)).toEqual(["invalid_range"])
  })

  it("accepts bass clef ranges inside Bb1 to G4", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Bass Clef",
      modes: ["Major"],
      range: {
        low: "Bb1",
        high: "G4",
      },
    }

    expect(validateFlowDraft(draft)).toEqual([])
  })

  it("rejects bass clef ranges outside Bb1 to G4", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Bass Clef",
      modes: ["Major"],
      range: {
        low: "A1",
        high: "G#4",
      },
    }

    expect(validateFlowDraft(draft)).toEqual(["invalid_range"])
  })

  it("expands draft into deterministic exercise specs", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["G", "C"],
      clef: "Treble Clef",
      modes: ["Natural Minor", "Major"],
      range: {
        low: "G3",
        high: "E5",
      },
      tempo: { kind: "single", bpm: 96 },
    }

    const specs = expandFlowDraftToExerciseSpecs(draft)

    expect(specs).toHaveLength(4)
    const expectedSpecs = [
      {
        key: "C",
        mode: "major",
        startOctave: 3,
        octaves: 3,
        clef: "treble",
        tempo: { kind: "single", bpm: 96 },
      },
      {
        key: "C",
        mode: "minor",
        startOctave: 3,
        octaves: 3,
        clef: "treble",
        tempo: { kind: "single", bpm: 96 },
      },
      {
        key: "G",
        mode: "minor",
        startOctave: 3,
        octaves: 3,
        clef: "treble",
        tempo: { kind: "single", bpm: 96 },
      },
      {
        key: "G",
        mode: "major",
        startOctave: 3,
        octaves: 3,
        clef: "treble",
        tempo: { kind: "single", bpm: 96 },
      },
    ]

    expect(specs).toEqual(expect.arrayContaining(expectedSpecs))
  })

  it("deduplicates selections and canonicalizes enharmonic key", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["F#/Gb", "F#/Gb"],
      clef: "Bass Clef",
      modes: ["Major", "Major"],
      range: {
        low: "Bb1",
        high: "G4",
      },
      tempo: { kind: "range", minBpm: 80, maxBpm: 120 },
    }

    const specs = expandFlowDraftToExerciseSpecs(draft)

    expect(specs).toEqual([
      {
        key: "F#",
        mode: "major",
        startOctave: 1,
        octaves: 3,
        clef: "bass",
        tempo: { kind: "range", minBpm: 80, maxBpm: 120 },
      },
    ])
  })

  it("throws when trying to expand an invalid draft", () => {
    const draft = createEmptyFlowDraft()

    expect(() => expandFlowDraftToExerciseSpecs(draft)).toThrow(
      "Cannot expand invalid flow draft.",
    )
  })
})
