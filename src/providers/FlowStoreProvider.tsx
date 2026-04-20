import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  CreateFlowResult,
  Flow,
  FlowDraft,
  InMemoryFlowDraftRepository,
  PREMADE_FLOWS,
  createEmptyFlowDraft,
} from "@/core/flows"
import { Flow2 } from "@/core/flows/Flow"
import { sqliteFlowGenerationService } from "@/core/flows/sqliteGenerationService"

type FlowStoreContextValue = {
  draft: FlowDraft
  flows: Flow[]
  premadeFlows: Flow[]
  getFlowById: (id: string) => Flow | undefined
  updateDraft: (partial: Partial<FlowDraft>) => void
  resetDraft: () => void
  createFlow: (name: string) => Promise<CreateFlowResult>
}

const FlowStoreContext = createContext<FlowStoreContextValue | null>(null)

export function FlowStoreProvider({ children }: PropsWithChildren) {
  const draftRepositoryRef = useRef(
    new InMemoryFlowDraftRepository(createEmptyFlowDraft),
  )

  const [flows, setFlows] = useState<Flow[]>([])
  const [draft, setDraft] = useState(() => draftRepositoryRef.current.get())

  useEffect(() => {
    let cancelled = false

    async function loadFlows() {
      try {
        const storedFlows = await Flow2.list()

        if (!cancelled) {
          setFlows(storedFlows)
        }
      } catch (error) {
        console.error("[db] failed to load flows:", error)
      }
    }

    void loadFlows()

    return () => {
      cancelled = true
    }
  }, [])

  const updateDraft = useCallback((partial: Partial<FlowDraft>) => {
    const current = draftRepositoryRef.current.get()
    const next: FlowDraft = {
      ...current,
      ...partial,
      range: {
        ...current.range,
        ...partial.range,
      },
    }

    draftRepositoryRef.current.save(next)
    setDraft(next)
  }, [])

  const resetDraft = useCallback(() => {
    draftRepositoryRef.current.reset()
    setDraft(draftRepositoryRef.current.get())
  }, [])

  const createFlow = useCallback(
    async (name: string) => {
      const result = await Flow2.createFromDraft({
        draft: draftRepositoryRef.current.get(),
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

      const storedFlows = await Flow2.list()
      setFlows(storedFlows)

      draftRepositoryRef.current.reset()
      setDraft(draftRepositoryRef.current.get())

      const legacyResult: CreateFlowResult = {
        ok: true,
        value: createdFlow,
      }

      return legacyResult
    },
    [setFlows, setDraft],
  )

  const getFlowById = useCallback(
    (id: string) =>
      flows.find((flow) => flow.id === id) ??
      PREMADE_FLOWS.find((flow) => flow.id === id),
    [flows],
  )

  const value = useMemo(
    () => ({
      draft,
      flows,
      premadeFlows: PREMADE_FLOWS,
      getFlowById,
      updateDraft,
      resetDraft,
      createFlow,
    }),
    [draft, flows, getFlowById, updateDraft, resetDraft, createFlow],
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
