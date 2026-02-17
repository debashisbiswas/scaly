import { Flow, FlowDraft } from "./types"

export interface FlowRepository {
  list(): Flow[]
  add(flow: Flow): void
}

export interface FlowDraftRepository {
  get(): FlowDraft
  save(draft: FlowDraft): void
  reset(): void
}

export class InMemoryFlowRepository implements FlowRepository {
  private flows: Flow[]

  constructor(seed: Flow[] = []) {
    this.flows = [...seed]
  }

  list() {
    return [...this.flows]
  }

  add(flow: Flow) {
    this.flows = [flow, ...this.flows]
  }
}

export class InMemoryFlowDraftRepository implements FlowDraftRepository {
  private draft: FlowDraft
  private readonly createEmptyDraft: () => FlowDraft

  constructor(createEmptyDraft: () => FlowDraft) {
    this.createEmptyDraft = createEmptyDraft
    this.draft = createEmptyDraft()
  }

  get() {
    return { ...this.draft, range: { ...this.draft.range } }
  }

  save(draft: FlowDraft) {
    this.draft = {
      ...draft,
      range: { ...draft.range },
    }
  }

  reset() {
    this.draft = this.createEmptyDraft()
  }
}
