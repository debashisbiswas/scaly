import VexflowRuntime, { Beam, Factory, Fraction, StaveNote } from "vexflow"

export type PracticeMode = "full" | "rhythm"

export interface RenderPracticeOptions {
  container: HTMLElement
  mode: PracticeMode
  width: number
  height: number
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

function createScaleNotes(
  factory: Factory,
  keys: readonly string[],
  duration: string,
) {
  return keys.map((key) => factory.StaveNote({ keys: [key], duration }))
}

function drawFull(factory: Factory, width: number) {
  const ascending = createScaleNotes(
    factory,
    [
      "c/4",
      "d/4",
      "e/4",
      "f/4",
      "g/4",
      "a/4",
      "b/4",
      "c/5",
      "d/5",
      "e/5",
      "f/5",
      "g/5",
      "a/5",
      "b/5",
      "c/6",
    ],
    "16",
  )

  const descending = [
    "c/6",
    "b/5",
    "a/5",
    "g/5",
    "f/5",
    "e/5",
    "d/5",
    "c/5",
    "b/4",
    "a/4",
    "g/4",
    "f/4",
    "e/4",
    "d/4",
  ].map((key) => factory.StaveNote({ keys: [key], duration: "16" }))
  descending.push(factory.StaveNote({ keys: ["c/4"], duration: "q" }))

  const voiceOne = factory.Voice({ time: "4/4" }).addTickables(ascending)
  const voiceTwo = factory.Voice({ time: "4/4" }).addTickables(descending)

  const topSystem = factory.System({
    x: 8,
    y: 10,
    width: Math.max(0, width - 16),
  })
  const bottomSystem = factory.System({
    x: 8,
    y: 92,
    width: Math.max(0, width - 16),
  })

  topSystem
    .addStave({ voices: [voiceOne] })
    .addClef("treble")
    .addTimeSignature("7/4")
  bottomSystem.addStave({ voices: [voiceTwo] }).addClef("treble")

  const topBeams = Beam.generateBeams(ascending, {
    groups: [new Fraction(2, 8)],
  })
  const bottomBeams = Beam.generateBeams(descending.slice(0, 14), {
    groups: [new Fraction(2, 8)],
  })

  factory.draw()
  const context = factory.getContext()
  topBeams.forEach((beam) => {
    beam.setContext(context).draw()
  })
  bottomBeams.forEach((beam) => {
    beam.setContext(context).draw()
  })
}

function drawRhythm(factory: Factory, width: number) {
  const notes: StaveNote[] = [
    factory.StaveNote({ keys: ["c/4"], duration: "8" }),
    factory.StaveNote({ keys: ["d/4"], duration: "16" }),
    factory.StaveNote({ keys: ["e/4"], duration: "16" }),
    factory.StaveNote({ keys: ["f/4"], duration: "16" }),
    factory.StaveNote({ keys: ["g/4"], duration: "16" }),
    factory.StaveNote({ keys: ["a/4"], duration: "16" }),
    factory.StaveNote({ keys: ["b/4"], duration: "16" }),
    factory.StaveNote({ keys: ["c/5"], duration: "8" }),
    factory.StaveNote({ keys: ["b/4"], duration: "16" }),
    factory.StaveNote({ keys: ["a/4"], duration: "16" }),
    factory.StaveNote({ keys: ["g/4"], duration: "16" }),
    factory.StaveNote({ keys: ["f/4"], duration: "16" }),
    factory.StaveNote({ keys: ["e/4"], duration: "16" }),
    factory.StaveNote({ keys: ["d/4"], duration: "16" }),
  ]

  const voice = factory.Voice({ time: "4/4" }).addTickables(notes)
  const system = factory.System({ x: 8, y: 10, width: Math.max(0, width - 16) })
  system
    .addStave({ voices: [voice] })
    .addClef("treble")
    .addTimeSignature("4/4")

  const beams = Beam.generateBeams(notes, {
    groups: [
      new Fraction(4, 16),
      new Fraction(4, 16),
      new Fraction(4, 16),
      new Fraction(4, 16),
    ],
  })

  factory.draw()
  const context = factory.getContext()
  beams.forEach((beam) => {
    beam.setContext(context).draw()
  })
}

export async function renderPracticeNotation(options: RenderPracticeOptions) {
  const { container, mode, width, height } = options

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

  if (mode === "full") {
    drawFull(factory, width)
    return
  }

  drawRhythm(factory, width)
}
