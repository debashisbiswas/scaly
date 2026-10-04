import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import Storage from "expo-sqlite/kv-store"

import { CreateFlowResult, Flow, PREMADE_FLOWS } from "@/core/flows"
import { Flow2 } from "@/core/flows/flow"
import { FlowDraft } from "@/core/flows/flow-draft"

const FLOW_ORDER_STORAGE_KEY = "flows.order"

async function listFlowsInSavedOrder() {
  const storedFlows = await Flow2.list()
  let rawOrder: string | null = null
  let orderedIds: string[] = []

  try {
    rawOrder = await Storage.getItemAsync(FLOW_ORDER_STORAGE_KEY)
  } catch (error) {
    console.warn("[storage] failed to load flow order:", error)
    return storedFlows
  }

  if (rawOrder) {
    try {
      const parsed = JSON.parse(rawOrder)
      if (Array.isArray(parsed)) {
        orderedIds = parsed.filter((id): id is string => typeof id === "string")
      }
    } catch {
      // A corrupt preference should not prevent the flow library from loading.
    }
  }

  const flowsById = new Map(storedFlows.map((flow) => [flow.id, flow]))
  const orderedFlows = orderedIds.flatMap((id) => {
    const flow = flowsById.get(id)
    if (!flow) return []
    flowsById.delete(id)
    return [flow]
  })
  const reconciledFlows = [...flowsById.values(), ...orderedFlows]
  const reconciledIds = reconciledFlows.map((flow) => flow.id)

  if (JSON.stringify(reconciledIds) !== JSON.stringify(orderedIds)) {
    try {
      await Storage.setItemAsync(
        FLOW_ORDER_STORAGE_KEY,
        JSON.stringify(reconciledIds),
      )
    } catch (error) {
      console.warn("[storage] failed to reconcile flow order:", error)
    }
  }

  return reconciledFlows
}

type FlowStoreContextValue = {
  draft: FlowDraft.Shape
  editingFlow: Flow | null
  flows: Flow[]
  premadeFlows: Flow[]
  getFlowById: (id: string) => Flow | undefined
  updateDraft: (partial: Partial<FlowDraft.Shape>) => void
  resetDraft: () => void
  startEditingFlow: (flow: Flow) => void
  createFlow: (name: string) => Promise<CreateFlowResult>
  saveFlow: (name: string) => Promise<CreateFlowResult>
  deleteFlow: (id: string) => Promise<void>
  deleteFlows: (ids: string[]) => Promise<void>
  reorderFlows: (orderedIds: string[]) => Promise<void>
}

const FlowStoreContext = createContext<FlowStoreContextValue | null>(null)

export function FlowStoreProvider({ children }: PropsWithChildren) {
  const [flows, setFlows] = useState<Flow[]>([])
  const [draft, setDraft] = useState(FlowDraft.createEmpty)
  const [editingFlow, setEditingFlow] = useState<Flow | null>(null)

  useEffect(() => {
    async function loadFlows() {
      try {
        const storedFlows = await listFlowsInSavedOrder()
        setFlows(storedFlows)
      } catch (error) {
        console.error("[db] failed to load flows:", error)
      }
    }

    loadFlows()
  }, [])

  const updateDraft = useCallback((partial: Partial<FlowDraft.Shape>) => {
    setDraft((current) => ({
      ...current,
      ...partial,
      range: {
        ...current.range,
        ...partial.range,
      },
    }))
  }, [])

  const resetDraft = useCallback(() => {
    setDraft(FlowDraft.createEmpty())
    setEditingFlow(null)
  }, [])

  const startEditingFlow = useCallback((flow: Flow) => {
    setDraft({
      ...flow.config,
      range: { ...flow.config.range },
    })
    setEditingFlow(flow)
  }, [])

  const createFlow = useCallback(
    async (name: string) => {
      const result = await Flow2.createFromDraft({
        draft,
        name,
      })

      if (!result.ok) {
        return result
      }

      const createdFlow = await Flow2.fromID(result.flowId)

      if (!createdFlow) {
        const legacyResult: CreateFlowResult = {
          ok: false,
          errors: [],
        }

        return legacyResult
      }

      const storedFlows = await listFlowsInSavedOrder()
      setFlows(storedFlows)

      setDraft(FlowDraft.createEmpty())

      const legacyResult: CreateFlowResult = {
        ok: true,
        value: createdFlow,
      }

      return legacyResult
    },
    [draft],
  )

  const saveFlow = useCallback(
    async (name: string) => {
      if (!editingFlow) {
        return createFlow(name)
      }

      const result = await Flow2.updateFromDraft({
        flowId: editingFlow.id,
        draft,
        name,
      })

      if (!result.ok) {
        const legacyResult: CreateFlowResult = {
          ok: false,
          errors: [...result.errors],
        }

        return legacyResult
      }

      const updatedFlow = await Flow2.fromID(result.flowId)

      if (!updatedFlow) {
        const legacyResult: CreateFlowResult = {
          ok: false,
          errors: [],
        }

        return legacyResult
      }

      const storedFlows = await listFlowsInSavedOrder()
      setFlows(storedFlows)

      setDraft(FlowDraft.createEmpty())
      setEditingFlow(null)

      const legacyResult: CreateFlowResult = {
        ok: true,
        value: updatedFlow,
      }

      return legacyResult
    },
    [createFlow, draft, editingFlow],
  )

  const getFlowById = useCallback(
    (id: string) =>
      flows.find((flow) => flow.id === id) ??
      PREMADE_FLOWS.find((flow) => flow.id === id),
    [flows],
  )

  const deleteFlow = useCallback(
    async (id: string) => {
      await Flow2.deleteByID(id)

      const storedFlows = await listFlowsInSavedOrder()
      setFlows(storedFlows)

      if (editingFlow?.id === id) {
        setDraft(FlowDraft.createEmpty())
        setEditingFlow(null)
      }
    },
    [editingFlow],
  )

  const deleteFlows = useCallback(
    async (ids: string[]) => {
      await Flow2.deleteByIDs(ids)

      const storedFlows = await listFlowsInSavedOrder()
      setFlows(storedFlows)

      if (editingFlow && ids.includes(editingFlow.id)) {
        setDraft(FlowDraft.createEmpty())
        setEditingFlow(null)
      }
    },
    [editingFlow],
  )

  const reorderFlows = useCallback(
    async (orderedIds: string[]) => {
      const previousFlows = flows
      const flowsById = new Map(flows.map((flow) => [flow.id, flow]))
      const reorderedFlows = orderedIds.flatMap((id) => {
        const flow = flowsById.get(id)
        if (!flow) return []
        flowsById.delete(id)
        return [flow]
      })
      reorderedFlows.push(...flowsById.values())
      setFlows(reorderedFlows)

      try {
        await Storage.setItemAsync(
          FLOW_ORDER_STORAGE_KEY,
          JSON.stringify(reorderedFlows.map((flow) => flow.id)),
        )
      } catch (error) {
        setFlows(previousFlows)
        throw error
      }
    },
    [flows],
  )

  const value = useMemo(
    () => ({
      draft,
      editingFlow,
      flows,
      premadeFlows: PREMADE_FLOWS,
      getFlowById,
      updateDraft,
      resetDraft,
      startEditingFlow,
      createFlow,
      saveFlow,
      deleteFlow,
      deleteFlows,
      reorderFlows,
    }),
    [
      draft,
      editingFlow,
      flows,
      getFlowById,
      updateDraft,
      resetDraft,
      startEditingFlow,
      createFlow,
      saveFlow,
      deleteFlow,
      deleteFlows,
      reorderFlows,
    ],
  )

  return (
    <FlowStoreContext.Provider value={value}>
      {children}
    </FlowStoreContext.Provider>
  )
}

export function useFlowStore() {
  const context = useContext(FlowStoreContext)

  if (!context) {
    throw new Error("useFlowStore must be used within FlowStoreProvider")
  }

  return context
}
