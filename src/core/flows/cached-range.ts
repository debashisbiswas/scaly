import { FlowDraft } from "./flow-draft"
import { Clef } from "./types"
import Storage from "expo-sqlite/kv-store"

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

    const key = clefToStorageKey(clef)
    Storage.setItemSync(key, JSON.stringify(range))
  }

  export const get = (clef: Clef): Range | undefined => {
    const key = clefToStorageKey(clef)
    const cachedValue = Storage.getItemSync(key)

    if (!cachedValue) return

    const parsed = JSON.parse(cachedValue) as FlowDraft.Shape["range"]
    console.log(
      `[initial range] returning cached value: ${JSON.stringify(parsed)}`,
    )
    return parsed
  }
}
