import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  CreateFlowResult,
  Flow,
  FlowDraft,
  InMemoryFlowDraftRepository,
  InMemoryFlowRepository,
  createEmptyFlowDraft,
  createFlowFromDraft,
} from "@/core/flows"

type FlowStoreContextValue = {
  draft: FlowDraft
  flows: Flow[]
  updateDraft: (partial: Partial<FlowDraft>) => void
  resetDraft: () => void
  createFlow: (name: string) => CreateFlowResult
}

const FlowStoreContext = createContext<FlowStoreContextValue | null>(null)

export function FlowStoreProvider({ children }: PropsWithChildren) {
  const flowRepositoryRef = useRef(new InMemoryFlowRepository())
  const draftRepositoryRef = useRef(
    new InMemoryFlowDraftRepository(createEmptyFlowDraft),
  )

  const [flows, setFlows] = useState(() => flowRepositoryRef.current.list())
  const [draft, setDraft] = useState(() => draftRepositoryRef.current.get())

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
    (name: string) => {
      const result = createFlowFromDraft({
        draft: draftRepositoryRef.current.get(),
        name,
      })

      if (!result.ok) {
        return result
      }

      flowRepositoryRef.current.add(result.value)
      setFlows(flowRepositoryRef.current.list())

      draftRepositoryRef.current.reset()
      setDraft(draftRepositoryRef.current.get())

      return result
    },
    [setFlows, setDraft],
  )

  const value = useMemo(
    () => ({
      draft,
      flows,
      updateDraft,
      resetDraft,
      createFlow,
    }),
    [draft, flows, updateDraft, resetDraft, createFlow],
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
