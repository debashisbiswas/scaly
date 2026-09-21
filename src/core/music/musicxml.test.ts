import { describe, expect, test } from "vitest"
import { MusicIR } from "./musicir"
import { MusicXML } from "./musicxml"

describe("MusicXML renderer", () => {
  test("renders a score from the music IR", () => {
    const score: MusicIR.Score = {
      keySignature: { fifths: 0 },
      timeSignature: { numerator: 4, denominator: 4 },
      clef: "bass",
      measures: [
        {
          notes: [
            {
              pitch: { step: "C", accidental: 2, octave: 4 },
              duration: "eighth",
              slur: "start",
            },
            {
              pitch: { step: "D", octave: 4 },
              duration: "sixteenth",
              slur: "stop",
            },
          ],
        },
        {
          notes: [
            {
              pitch: { step: "C", octave: 4 },
              duration: "whole",
            },
          ],
          finalBarline: true,
        },
      ],
    }

    const xml = MusicXML.render(score)

    expect(xml).toContain("<divisions>4</divisions>")
    expect(xml).toContain("<fifths>0</fifths>")
    expect(xml).toContain("<beats>4</beats>")
    expect(xml).toContain("<beat-type>4</beat-type>")
    expect(xml).toContain("<sign>F</sign>")
    expect(xml).toContain("<line>4</line>")
    expect(xml).toContain("<alter>2</alter>")
    expect(xml).toContain("<duration>2</duration>")
    expect(xml).toContain("<duration>1</duration>")
    expect(xml).toContain('<slur type="start"></slur>')
    expect(xml).toContain("<bar-style>light-heavy</bar-style>")
    expect(xml).not.toMatch(/<\/measure>\s*,/)
  })
})
