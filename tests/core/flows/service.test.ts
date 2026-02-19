import { describe, expect, it } from "vitest"

import { NOTE_STEP_OPTIONS } from "@/core/flows/constants"
import {
  createEmptyFlowDraft,
  createFlowFromDraft,
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
    expect(draft.range).toEqual({
      low: NOTE_STEP_OPTIONS[4].label,
      high: NOTE_STEP_OPTIONS[16].label,
    })
  })

  it("validates required draft fields", () => {
    const draft = createEmptyFlowDraft()

    expect(validateFlowDraft(draft)).toEqual([
      "missing_keys",
      "missing_clef",
      "missing_modes",
      "missing_slur_patterns",
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
})
