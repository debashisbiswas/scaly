import { Key } from "tonal"

export const Modes = [
  "major",
  "minor",
  "harmonic minor",
  "melodic minor",
] as const
export type Mode = (typeof Modes)[number]

export const getKeyWithMode = (key: string, mode: Mode) => {
  if (mode === "major") {
    return Key.majorKey(key)
  } else if (
    mode === "minor" ||
    mode === "harmonic minor" ||
    mode === "melodic minor"
  ) {
    return Key.minorKey(key)
  } else {
    const _never: never = mode
    throw new Error(`Unexpected mode: ${_never}`)
  }
}

export const getReasonableModes = (key: string) => {
  return Modes.filter((mode) => {
    const current = getKeyWithMode(key, mode)
    return Math.abs(current.alteration) <= 7
  })
}
