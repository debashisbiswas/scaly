import { FlowDraft } from "./flow-draft"
import { Clef } from "./types"

function getStorage(): typeof import("expo-sqlite/kv-store").default {
  // Defer loading native storage to prevent the import from breaking tests.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("expo-sqlite/kv-store").default
}

export namespace CachedRange {
  type Range = FlowDraft.Shape["range"]

  const clefToStorageKey = (clef: Clef) => {
    let result: string

    switch (clef) {
      case "Treble Clef":
        result = "last_range_treble"
        break
      case "Bass Clef":
        result = "last_range_bass"
        break
      default:
        const _never: never = clef
        throw new Error(`Unexpected clef: ${clef}`)
    }

    return result
  }

  export const store = (clef: Clef | null, range: Range) => {
    if (!clef) return null

    console.log(
      `[initial range] storing cached value: ${JSON.stringify(range)}`,
    )
    const key = clefToStorageKey(clef)
    getStorage().setItemSync(key, JSON.stringify(range))
  }

  export const get = (clef: Clef): Range | undefined => {
    const key = clefToStorageKey(clef)
    const cachedValue = getStorage().getItemSync(key)

    if (!cachedValue) return

    const parsed = JSON.parse(cachedValue) as FlowDraft.Shape["range"]
    console.log(
      `[initial range] returning cached value: ${JSON.stringify(parsed)}`,
    )
    return parsed
  }
}
