import { MusicIR } from "./musicir"

export namespace MusicXML {
  const quarterNoteDivisions = 4

  function durationToDivisions(duration: MusicIR.Duration) {
    return MusicIR.durationInSixteenths(duration)
  }

  function noteToMusicXML(note: MusicIR.Note) {
    const alter =
      note.pitch.accidental === undefined
        ? ""
        : `<alter>${note.pitch.accidental}</alter>`
    const notations = note.slur
      ? `<notations><slur type="${note.slur}"></slur></notations>`
      : ""

    return `
      <note>
        <pitch>
          <step>${note.pitch.step}</step>
          ${alter}
          <octave>${note.pitch.octave}</octave>
        </pitch>
        <duration>${durationToDivisions(note.duration)}</duration>
        ${notations}
      </note>
    `
  }

  function attributesToMusicXML(score: MusicIR.Score) {
    const clef =
      score.clef === "bass" ? { sign: "F", line: 4 } : { sign: "G", line: 2 }

    return `
      <attributes>
        <divisions>${quarterNoteDivisions}</divisions>
        <key><fifths>${score.keySignature.fifths}</fifths></key>
        <time>
          <beats>${score.timeSignature.numerator}</beats>
          <beat-type>${score.timeSignature.denominator}</beat-type>
        </time>
        <clef>
          <sign>${clef.sign}</sign>
          <line>${clef.line}</line>
        </clef>
      </attributes>
    `
  }

  function measureToMusicXML(
    measure: MusicIR.Measure,
    score: MusicIR.Score,
    index: number,
  ) {
    const doubleBarXML = `
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    `

    return `
      <measure>
        ${index === 0 ? attributesToMusicXML(score) : ""}
        ${measure.notes.map(noteToMusicXML).join("")}
        ${measure.finalBarline ? doubleBarXML : ""}
      </measure>
    `
  }

  export function render(score: MusicIR.Score) {
    const measuresXML = score.measures
      .map((measure, index) => measureToMusicXML(measure, score, index))
      .join("")

    return `
      <?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
      <score-partwise version="4.0">
        <part-list>
          <score-part id="P1">
            <part-name>Music</part-name>
          </score-part>
        </part-list>
        <part id="P1">
          ${measuresXML}
        </part>
      </score-partwise>
    `
  }
}
