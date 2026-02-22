import { renderPracticeNotation } from "@/notation/practice"
import { renderRangeNotation } from "@/notation/range"

type Kind = "practice" | "range"

function required<T extends Element>(selector: string) {
  const element = document.querySelector<T>(selector)
  if (!element) throw new Error(`Missing element: ${selector}`)
  return element
}

const form = required<HTMLFormElement>("#controls")
const score = required<HTMLDivElement>("#score")
const errors = required<HTMLDivElement>("#errors")
const renderer = required<HTMLSelectElement>("#renderer")
const mode = required<HTMLSelectElement>("#mode")
const modeField = required<HTMLLabelElement>("#modeField")
const left = required<HTMLInputElement>("#left")
const right = required<HTMLInputElement>("#right")
const leftField = required<HTMLLabelElement>("#leftField")
const rightField = required<HTMLLabelElement>("#rightField")
const width = required<HTMLInputElement>("#width")
const height = required<HTMLInputElement>("#height")

const defaults = {
  practice: { width: 720, height: 214 },
  range: { width: 720, height: 190 },
}

const intOr = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : fallback
}

function setError(error: unknown) {
  if (!error) {
    errors.textContent = ""
    return
  }
  errors.textContent =
    error instanceof Error
      ? `${error.message}\n${error.stack || ""}`
      : String(error)
}

function syncFields() {
  const kind = renderer.value as Kind
  const range = kind === "range"
  leftField.style.display = range ? "grid" : "none"
  rightField.style.display = range ? "grid" : "none"
  modeField.style.display = range ? "none" : "grid"
  width.value = String(defaults[kind].width)
  height.value = String(defaults[kind].height)
}

async function render() {
  setError(null)
  try {
    if (renderer.value === "range") {
      await renderRangeNotation({
        container: score,
        leftNoteKey: left.value.trim() || "c/4",
        rightNoteKey: right.value.trim() || "c/4",
        width: intOr(width.value, defaults.range.width),
        height: intOr(height.value, defaults.range.height),
      })
      return
    }

    await renderPracticeNotation({
      container: score,
      mode: mode.value === "rhythm" ? "rhythm" : "full",
      width: intOr(width.value, defaults.practice.width),
      height: intOr(height.value, defaults.practice.height),
    })
  } catch (error) {
    setError(error)
  }
}

window.addEventListener("error", (event) => {
  setError(event.error || event.message)
})

window.addEventListener("unhandledrejection", (event) => {
  setError(event.reason)
})

renderer.addEventListener("change", () => {
  syncFields()
  void render()
})

form.addEventListener("submit", (event) => {
  event.preventDefault()
  void render()
})

syncFields()
void render()
