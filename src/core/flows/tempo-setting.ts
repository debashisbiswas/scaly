import { TEMPO_BUCKETS } from "./constants"

export namespace TempoSetting {
  type Single = {
    kind: "single"
    bpm: number
  }

  type Range = {
    kind: "range"
    minBpm: number
    maxBpm: number
  }

  export type Shape = Single | Range

  export function expand(setting: Shape): Shape[] {
    if (setting.kind === "single") {
      return [setting]
    }

    return TEMPO_BUCKETS.filter(
      (bucket) =>
        bucket.maxBpm >= setting.minBpm && bucket.minBpm <= setting.maxBpm,
    ).map((bucket) => ({
      kind: "range",
      minBpm: bucket.minBpm,
      maxBpm: bucket.maxBpm,
    }))
  }
}
