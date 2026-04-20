import { FlowDraft } from "./types"

export class InMemoryFlowDraftRepository {
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
