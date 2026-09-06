import { TempoSetting } from "@/core/flows/tempo-setting"
import { describe, expect, it } from "vitest"

describe("TempoSetting", () => {
  describe("expand", () => {
    it("expands a single tempo setting", () => {
      const actual = TempoSetting.expand({ kind: "single", bpm: 120 })
      expect(actual).toEqual([{ kind: "single", bpm: 120 }])
    })

    it("expands a range tempo setting", () => {
      const actual = TempoSetting.expand({
        kind: "range",
        minBpm: 80,
        maxBpm: 120,
      })

      expect(actual).toEqual([
        { kind: "range", minBpm: 80, maxBpm: 83 },
        { kind: "range", minBpm: 84, maxBpm: 87 },
        { kind: "range", minBpm: 88, maxBpm: 91 },
        { kind: "range", minBpm: 92, maxBpm: 95 },
        { kind: "range", minBpm: 96, maxBpm: 99 },
        { kind: "range", minBpm: 100, maxBpm: 103 },
        { kind: "range", minBpm: 104, maxBpm: 107 },
        { kind: "range", minBpm: 108, maxBpm: 111 },
        { kind: "range", minBpm: 112, maxBpm: 115 },
        { kind: "range", minBpm: 116, maxBpm: 119 },
        { kind: "range", minBpm: 120, maxBpm: 125 },
      ])
    })
  })
})
