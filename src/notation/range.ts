import VexflowRuntime, { Accidental, Factory } from "vexflow"

export interface RenderRangeOptions {
  container: HTMLElement
  width: number
  height: number
  leftNoteKey: string
  rightNoteKey: string
}

let fontLoadPromise: Promise<void> | null = null

function ensureFontsLoaded() {
  if (!fontLoadPromise) {
    fontLoadPromise = VexflowRuntime.loadFonts("Bravura", "Academico")
      .then(() => {
        VexflowRuntime.setFonts("Bravura", "Academico")
      })
      .catch(() => {
        // Rendering still works with fallback behavior.
      })
  }

  return fontLoadPromise
}

function buildNote(factory: Factory, noteKey: string) {
  const text = String(noteKey || "c/4")
  const parts = text.split("/")

  if (parts.length !== 2) {
    return factory.StaveNote({ keys: ["c/4"], duration: "h" })
  }

  const pitch = parts[0]
  const octave = parts[1]
  const match = pitch.match(/^([a-g])(#{1,2}|b{1,2})?$/i)

  if (!match) {
    return factory.StaveNote({ keys: ["c/4"], duration: "h" })
  }

  const baseKey = `${match[1].toLowerCase()}/${octave}`
  const accidental = match[2]
  const note = factory.StaveNote({ keys: [baseKey], duration: "h" })

  if (accidental) {
    try {
      note.addModifier(new Accidental(accidental), 0)
    } catch {
      // Ignore invalid accidental modifiers.
    }
  }

  return note
}

export async function renderRangeNotation(options: RenderRangeOptions) {
  const { container, width, height, leftNoteKey, rightNoteKey } = options

  await ensureFontsLoaded()

  container.innerHTML = ""
  const scoreElement = document.createElement("div")
  scoreElement.id = "score"
  container.appendChild(scoreElement)

  const factory = new Factory({
    renderer: {
      elementId: "score",
      width: Math.round(width),
      height: Math.round(height),
    },
  })

  const system = factory.System({
    x: 10,
    y: 22,
    width: Math.max(0, Math.round(width) - 20),
  })

  const voice = factory
    .Voice({ time: "2/2" })
    .addTickables([
      buildNote(factory, leftNoteKey),
      buildNote(factory, rightNoteKey),
    ])

  system.addStave({ voices: [voice] }).addClef("treble")
  factory.draw()
}
