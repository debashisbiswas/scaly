import { describe, expect, it } from "vitest"

import { getClefRangeConfig } from "@/core/flows/constants"
import {
  createEmptyFlowDraft,
  createFlowFromDraft,
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
    expect(draft.slurPatternIds).toEqual([])
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

  it("builds a flow from a valid draft", () => {
    const now = new Date("2026-02-17T10:00:00.000Z")
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Treble Clef",
      modes: ["Major"],
      slurPatternIds: ["full-phrase"],
    }

    const result = createFlowFromDraft({
      draft,
      name: "  Jury Routine  ",
      now,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) {
      return
    }

    expect(result.value.name).toBe("Jury Routine")
    expect(result.value.config).toEqual(draft)
    expect(result.value.progressPercent).toBe(0)
    expect(result.value.createdAt).toBe(now.toISOString())
    expect(result.value.updatedAt).toBe(now.toISOString())
  })

  it("rejects invalid tempo and empty name", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Treble Clef",
      modes: ["Major"],
      slurPatternIds: ["full-phrase"],
      tempo: { kind: "range", minBpm: 120, maxBpm: 80 } as const,
    }

    const result = createFlowFromDraft({ draft, name: "   " })

    expect(result.ok).toBe(false)
    if (result.ok) {
      return
    }
    expect(result.errors).toEqual(["invalid_tempo"])
  })

  it("normalizes duplicate selections for multi-select fields", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C", "C"],
      clef: "Treble Clef",
      modes: ["Major", "Major"],
      slurPatternIds: ["full-phrase", "full-phrase"],
    }

    const normalized = normalizeFlowDraft(draft)

    expect(normalized.keys).toEqual(["C"])
    expect(normalized.clef).toBe("Treble Clef")
    expect(normalized.modes).toEqual(["Major"])
    expect(normalized.slurPatternIds).toEqual(["full-phrase"])
  })

  it("accepts accidental pitch labels in range", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["C"],
      clef: "Treble Clef",
      modes: ["Major"],
      slurPatternIds: ["full-phrase"],
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
      slurPatternIds: ["full-phrase"],
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
      slurPatternIds: ["full-phrase"],
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
      slurPatternIds: ["full-phrase"],
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
      slurPatternIds: ["every-beat", "full-phrase"],
      range: {
        low: "G3",
        high: "E5",
      },
      tempo: { kind: "single", bpm: 96 },
    }

    const specs = expandFlowDraftToExerciseSpecs(draft)

    expect(specs).toHaveLength(8)
    expect(specs[0]).toEqual({
      key: "C",
      mode: "major",
      rhythm: "sixteenths",
      slurPattern: "slur four",
      startOctave: 3,
      octaves: 3,
      clef: "treble",
      tempo: { kind: "single", bpm: 96 },
    })
    expect(specs[1]).toEqual({
      key: "C",
      mode: "major",
      rhythm: "sixteenths",
      slurPattern: "slur two tongue two",
      startOctave: 3,
      octaves: 3,
      clef: "treble",
      tempo: { kind: "single", bpm: 96 },
    })
    expect(specs[2].mode).toBe("minor")
    expect(specs[4].key).toBe("G")
  })

  it("deduplicates selections and canonicalizes enharmonic key", () => {
    const draft: FlowDraft = {
      ...createEmptyFlowDraft(),
      keys: ["F#/Gb", "F#/Gb"],
      clef: "Bass Clef",
      modes: ["Major", "Major"],
      slurPatternIds: ["tongue-1-slur-3", "tongue-1-slur-3"],
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
        rhythm: "sixteenths",
        slurPattern: "tongue one slur three",
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
