import { useRouter } from "expo-router"
import { useState } from "react"
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { NOTE_STEP_OPTIONS } from "@/core/flows"

import RangeStaff from "@/components/RangeStaff"
import TopBar from "@/components/TopBar"
import VerticalNoteSlider from "@/components/VerticalNoteSlider"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const NATURAL_NOTE_OFFSET: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

const SHARP_NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
]

const FLAT_NOTE_NAMES = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
]

const CHROMATIC_MIN_MIDI = 48
const CHROMATIC_MAX_MIDI = 84

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function parseNaturalLabel(label: string) {
  const match = label.match(/^([A-G])(\d)$/)

  if (!match) {
    return { noteName: "C", octave: 4 }
  }

  return {
    noteName: match[1],
    octave: Number(match[2]),
  }
}

function naturalLabelToChromaticIndex(label: string) {
  const { noteName, octave } = parseNaturalLabel(label)
  const midi = (octave + 1) * 12 + NATURAL_NOTE_OFFSET[noteName]

  return clamp(
    midi - CHROMATIC_MIN_MIDI,
    0,
    CHROMATIC_MAX_MIDI - CHROMATIC_MIN_MIDI,
  )
}

function buildChromaticSteps() {
  const notes: {
    isNatural: boolean
    sharpLabel: string
    flatLabel: string
    sharpKey: string
    flatKey: string
  }[] = []

  for (let midi = CHROMATIC_MIN_MIDI; midi <= CHROMATIC_MAX_MIDI; midi += 1) {
    const octave = Math.floor(midi / 12) - 1
    const pitchClass = midi % 12
    const sharpName = SHARP_NOTE_NAMES[pitchClass]
    const flatName = FLAT_NOTE_NAMES[pitchClass]
    const sharpLabel = `${sharpName}${octave}`
    const flatLabel = `${flatName}${octave}`

    notes.push({
      isNatural: sharpName.length === 1,
      sharpLabel,
      flatLabel,
      sharpKey: `${sharpName.toLowerCase()}/${octave}`,
      flatKey: `${flatName.toLowerCase()}/${octave}`,
    })
  }

  return notes
}

function formatManualAccidentalLabel(label: string, accidental: -1 | 0 | 1) {
  const { noteName, octave } = parseNaturalLabel(label)

  if (accidental === 1) {
    return `${noteName}#${octave}`
  }

  if (accidental === -1) {
    return `${noteName}b${octave}`
  }

  return `${noteName}${octave}`
}

function formatManualAccidentalVexflowKey(
  label: string,
  accidental: -1 | 0 | 1,
) {
  const { noteName, octave } = parseNaturalLabel(label)
  const suffix = accidental === 1 ? "#" : accidental === -1 ? "b" : ""
  return `${noteName.toLowerCase()}${suffix}/${octave}`
}

function getChromaticLabel(
  note: {
    isNatural: boolean
    sharpLabel: string
    flatLabel: string
  },
  direction: 1 | -1,
) {
  if (note.isNatural) {
    return note.sharpLabel
  }

  return direction > 0 ? note.sharpLabel : note.flatLabel
}

function getChromaticKey(
  note: {
    isNatural: boolean
    sharpKey: string
    flatKey: string
  },
  direction: 1 | -1,
) {
  if (note.isNatural) {
    return note.sharpKey
  }

  return direction > 0 ? note.sharpKey : note.flatKey
}

function AccidentalControls({
  value,
  onChange,
}: {
  value: -1 | 0 | 1
  onChange: (next: -1 | 0 | 1) => void
}) {
  const buttonStyle = (active: boolean) => ({
    borderWidth: 1,
    borderColor: active ? "#0F172A" : "#94A3B8",
    backgroundColor: active ? "#E2E8F0" : "#FFFFFF",
    width: 28,
    height: 24,
    borderRadius: 6,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  })

  return (
    <View style={{ gap: 6 }}>
      <TouchableOpacity
        style={buttonStyle(value === 1)}
        onPress={() => onChange(value === 1 ? 0 : 1)}
      >
        <Text style={{ fontSize: 12, fontWeight: "700" }}>#</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={buttonStyle(value === -1)}
        onPress={() => onChange(value === -1 ? 0 : -1)}
      >
        <Text style={{ fontSize: 12, fontWeight: "700" }}>b</Text>
      </TouchableOpacity>
    </View>
  )
}

const CHROMATIC_STEPS = buildChromaticSteps()
const NOTE_STEPS = NOTE_STEP_OPTIONS

export default function DebugRange() {
  const router = useRouter()
  const { draft } = useFlowStore()
  const { width: screenWidth } = useWindowDimensions()

  const [chromaticLeftIndex, setChromaticLeftIndex] = useState(() =>
    naturalLabelToChromaticIndex(draft.range.low),
  )
  const [chromaticRightIndex, setChromaticRightIndex] = useState(() =>
    naturalLabelToChromaticIndex(draft.range.high),
  )
  const [chromaticLeftDirection, setChromaticLeftDirection] = useState<1 | -1>(
    1,
  )
  const [chromaticRightDirection, setChromaticRightDirection] = useState<
    1 | -1
  >(1)

  const [manualLeftIndex, setManualLeftIndex] = useState(() => {
    const index = NOTE_STEPS.findIndex((step) => step.label === draft.range.low)
    return index >= 0 ? index : 4
  })
  const [manualRightIndex, setManualRightIndex] = useState(() => {
    const index = NOTE_STEPS.findIndex(
      (step) => step.label === draft.range.high,
    )
    return index >= 0 ? index : 16
  })
  const [manualLeftAccidental, setManualLeftAccidental] = useState<-1 | 0 | 1>(
    0,
  )
  const [manualRightAccidental, setManualRightAccidental] = useState<
    -1 | 0 | 1
  >(0)

  const staffWidth = Math.max(180, Math.min(screenWidth - 152, 420))

  const chromaticLeftNote = CHROMATIC_STEPS[chromaticLeftIndex]
  const chromaticRightNote = CHROMATIC_STEPS[chromaticRightIndex]
  const chromaticLeftLabel = getChromaticLabel(
    chromaticLeftNote,
    chromaticLeftDirection,
  )
  const chromaticRightLabel = getChromaticLabel(
    chromaticRightNote,
    chromaticRightDirection,
  )

  const manualLeftNote = NOTE_STEPS[manualLeftIndex]
  const manualRightNote = NOTE_STEPS[manualRightIndex]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar title="Demos" subtitle="" onBack={() => router.back()} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 20,
          paddingBottom: 28,
          gap: 18,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 10,
            padding: 12,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }}>
            sharp when sliding up, flat when sliding down
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <VerticalNoteSlider
              value={chromaticLeftIndex}
              min={0}
              max={CHROMATIC_STEPS.length - 1}
              onValueChange={(next) => {
                setChromaticLeftIndex((prev) => {
                  if (next !== prev) {
                    setChromaticLeftDirection(next > prev ? 1 : -1)
                  }

                  return next
                })
              }}
              topLabel={CHROMATIC_STEPS[CHROMATIC_STEPS.length - 1].sharpLabel}
              bottomLabel={CHROMATIC_STEPS[0].sharpLabel}
            />

            <View style={{ flex: 1, alignItems: "center", gap: 12 }}>
              <RangeStaff
                width={staffWidth}
                leftNoteKey={getChromaticKey(
                  chromaticLeftNote,
                  chromaticLeftDirection,
                )}
                rightNoteKey={getChromaticKey(
                  chromaticRightNote,
                  chromaticRightDirection,
                )}
              />

              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  Left: {chromaticLeftLabel}
                </Text>
                <Text style={{ fontWeight: "600" }}>
                  Right: {chromaticRightLabel}
                </Text>
              </View>
            </View>

            <VerticalNoteSlider
              value={chromaticRightIndex}
              min={0}
              max={CHROMATIC_STEPS.length - 1}
              onValueChange={(next) => {
                setChromaticRightIndex((prev) => {
                  if (next !== prev) {
                    setChromaticRightDirection(next > prev ? 1 : -1)
                  }

                  return next
                })
              }}
              topLabel={CHROMATIC_STEPS[CHROMATIC_STEPS.length - 1].sharpLabel}
              bottomLabel={CHROMATIC_STEPS[0].sharpLabel}
            />
          </View>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#D1D5DB",
            borderRadius: 10,
            padding: 12,
            gap: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }}>sharp and flat buttons</Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <VerticalNoteSlider
                value={manualLeftIndex}
                min={0}
                max={NOTE_STEPS.length - 1}
                onValueChange={setManualLeftIndex}
                topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
                bottomLabel={NOTE_STEPS[0].label}
              />
              <AccidentalControls
                value={manualLeftAccidental}
                onChange={setManualLeftAccidental}
              />
            </View>

            <View style={{ flex: 1, alignItems: "center", gap: 12 }}>
              <RangeStaff
                width={staffWidth}
                leftNoteKey={formatManualAccidentalVexflowKey(
                  manualLeftNote.label,
                  manualLeftAccidental,
                )}
                rightNoteKey={formatManualAccidentalVexflowKey(
                  manualRightNote.label,
                  manualRightAccidental,
                )}
              />

              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                  paddingHorizontal: 4,
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  Left:{" "}
                  {formatManualAccidentalLabel(
                    manualLeftNote.label,
                    manualLeftAccidental,
                  )}
                </Text>
                <Text style={{ fontWeight: "600" }}>
                  Right:{" "}
                  {formatManualAccidentalLabel(
                    manualRightNote.label,
                    manualRightAccidental,
                  )}
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <AccidentalControls
                value={manualRightAccidental}
                onChange={setManualRightAccidental}
              />
              <VerticalNoteSlider
                value={manualRightIndex}
                min={0}
                max={NOTE_STEPS.length - 1}
                onValueChange={setManualRightIndex}
                topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
                bottomLabel={NOTE_STEPS[0].label}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
