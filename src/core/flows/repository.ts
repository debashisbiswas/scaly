import { FlowDraft } from "./flow-draft"

export class InMemoryFlowDraftRepository {
  private draft: FlowDraft.Shape
  private readonly createEmptyDraft: () => FlowDraft.Shape

  constructor(createEmptyDraft: () => FlowDraft.Shape) {
    this.createEmptyDraft = createEmptyDraft
    this.draft = createEmptyDraft()
  }

  get() {
    return { ...this.draft, range: { ...this.draft.range } }
  }

  save(draft: FlowDraft.Shape) {
    this.draft = {
      ...draft,
      range: { ...draft.range },
    }
  }

  reset() {
    this.draft = this.createEmptyDraft()
  }
}
