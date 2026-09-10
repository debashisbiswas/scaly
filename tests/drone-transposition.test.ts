import {
  isDroneTransposition,
  transposeDroneFrequency,
} from "@/core/droneTransposition"
import { describe, expect, it } from "vitest"

describe("drone transposition", () => {
  it.each([
    ["concert", 440],
    ["bb", 391.995],
    ["eb", 261.626],
    ["f", 293.665],
  ] as const)("transposes A4 for %s instruments", (transposition, expected) => {
    expect(transposeDroneFrequency(440, transposition)).toBeCloseTo(expected, 3)
  })

  it("validates persisted transposition values", () => {
    expect(isDroneTransposition("bb")).toBe(true)
    expect(isDroneTransposition("invalid")).toBe(false)
  })
})
