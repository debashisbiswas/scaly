import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import {
  Flow,
  KeySignature,
  ScaleMode,
  SlurPatternId,
} from "@/core/flows"
import {
  Mode,
  RhythmPattern,
  SlurPattern,
  generateMusicXMLForScale,
} from "@/core/music/Scales"
import { View } from "react-native"

interface PracticeStaffProps {
  flow: Flow
  mode: "full" | "rhythm"
  width: number
  height: number
}

function parsePitchLabel(label: string) {
  const match = label.match(/^([A-G])([#b]?)(\d+)$/)

  if (!match) {
    return null
  }

  return {
    noteName: match[1],
    accidental: match[2],
    octave: Number(match[3]),
  }
}

function getPracticeKey(key: KeySignature): string {
  if (key === "F#/Gb") {
    return "F#"
  }

  return key
}

function getPracticeMode(mode: ScaleMode): Mode {
  switch (mode) {
    case "Major":
      return "major"
    case "Natural Minor":
      return "minor"
    case "Harmonic Minor":
      return "harmonic minor"
    case "Melodic Minor":
      return "melodic minor"
    default: {
      const _never: never = mode
      return _never
    }
  }
}

function getPracticePattern(patternId: SlurPatternId): {
  rhythm: RhythmPattern
  slurPattern: SlurPattern
} {
  switch (patternId) {
    case "full-phrase":
      return {
        rhythm: "sixteenths",
        slurPattern: "slur four",
      }
    case "every-beat":
      return {
        rhythm: "sixteenths",
        slurPattern: "slur two tongue two",
      }
    case "tongue-1-slur-3":
      return {
        rhythm: "sixteenths",
        slurPattern: "tongue one slur three",
      }
    default: {
      const _never: never = patternId
      return _never
    }
  }
}

function getPracticeOctaves(low: string, high: string) {
  const lowPitch = parsePitchLabel(low)
  const highPitch = parsePitchLabel(high)

  if (!lowPitch || !highPitch) {
    return {
      startOctave: 4,
      octaves: 1,
    }
  }

  const startOctave = lowPitch.octave
  const octaveSpan = Math.max(0, highPitch.octave - lowPitch.octave)

  return {
    startOctave,
    octaves: Math.max(1, Math.min(3, octaveSpan + 1)),
  }
}

export default function PracticeStaff({
  flow,
  mode,
  width,
  height,
}: PracticeStaffProps) {
  const key = getPracticeKey(flow.config.keys[0] ?? "C")
  const scaleMode = getPracticeMode(flow.config.modes[0] ?? "Major")
  const pattern = getPracticePattern(flow.config.slurPatternIds[0] ?? "every-beat")
  const { startOctave, octaves } = getPracticeOctaves(
    flow.config.range.low,
    flow.config.range.high,
  )

  const xml = generateMusicXMLForScale({
    key: mode === "rhythm" ? "C" : key,
    mode: mode === "rhythm" ? "major" : scaleMode,
    rhythm: pattern.rhythm,
    slurPattern: pattern.slurPattern,
    octaves: mode === "rhythm" ? 1 : octaves,
    startOctave: mode === "rhythm" ? 4 : startOctave,
  })

  const viewerHeight =
    mode === "full" ? Math.max(180, Math.min(height, 320)) : height

  return (
    <View style={{ width, height: viewerHeight }}>
      <MusicXMLViewer musicXML={xml} />
    </View>
  )
}
