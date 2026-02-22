import { useRouter } from "expo-router"
import { useState } from "react"
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { NOTE_STEP_OPTIONS } from "@/core/flows"

import RangeStaff from "@/components/RangeStaff"
import TopBar from "@/components/TopBar"
import VerticalNoteSlider from "@/components/VerticalNoteSlider"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const NOTE_STEPS = NOTE_STEP_OPTIONS
const NATURAL_NOTE_OFFSET: Record<string, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

function parsePitchLabel(label: string) {
  const match = label.match(/^([A-G])([#b]?)(\d+)$/)

  if (!match) {
    return {
      noteName: "C",
      accidental: 0 as -1 | 0 | 1,
      octave: 4,
    }
  }

  return {
    noteName: match[1],
    accidental: (match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0) as
      | -1
      | 0
      | 1,
    octave: Number(match[3]),
  }
}

function formatManualAccidentalLabel(label: string, accidental: -1 | 0 | 1) {
  const { noteName, octave } = parsePitchLabel(label)

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
  const { noteName, octave } = parsePitchLabel(label)
  const suffix = accidental === 1 ? "#" : accidental === -1 ? "b" : ""

  return `${noteName.toLowerCase()}${suffix}/${octave}`
}

function pitchLabelToMidi(label: string) {
  const { noteName, accidental, octave } = parsePitchLabel(label)
  return (octave + 1) * 12 + NATURAL_NOTE_OFFSET[noteName] + accidental
}

function getInitialSliderState(label: string, fallbackIndex: number) {
  const { noteName, accidental, octave } = parsePitchLabel(label)
  const naturalLabel = `${noteName}${octave}`
  const index = NOTE_STEPS.findIndex((step) => step.label === naturalLabel)

  return {
    index: index >= 0 ? index : fallbackIndex,
    accidental,
  }
}

type SliderState = {
  index: number
  accidental: -1 | 0 | 1
}

function getPitchLabelFromState(state: SliderState) {
  return formatManualAccidentalLabel(
    NOTE_STEPS[state.index].label,
    state.accidental,
  )
}

function getMidiFromState(state: SliderState) {
  return pitchLabelToMidi(getPitchLabelFromState(state))
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
    width: 36,
    height: 32,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  })

  return (
    <View style={{ gap: 6 }}>
      <TouchableOpacity
        style={buttonStyle(value === 1)}
        onPress={() => onChange(value === 1 ? 0 : 1)}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>#</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={buttonStyle(value === -1)}
        onPress={() => onChange(value === -1 ? 0 : -1)}
      >
        <Text style={{ fontSize: 16, fontWeight: "700" }}>b</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function ChooseKey() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const { width: screenWidth } = useWindowDimensions()
  const [selection, setSelection] = useState<{
    left: SliderState
    right: SliderState
  }>(() => ({
    left: getInitialSliderState(draft.range.low, 4),
    right: getInitialSliderState(draft.range.high, 16),
  }))

  const leftState = selection.left
  const rightState = selection.right

  const leftIndex = leftState.index
  const rightIndex = rightState.index
  const leftAccidental = leftState.accidental
  const rightAccidental = rightState.accidental

  const setLeftIndex = (index: number) => {
    setSelection((previous) => {
      const nextLeft = { ...previous.left, index }

      if (nextLeft.index > previous.right.index) {
        return previous
      }

      if (getMidiFromState(nextLeft) >= getMidiFromState(previous.right)) {
        return previous
      }

      return {
        ...previous,
        left: nextLeft,
      }
    })
  }

  const setRightIndex = (index: number) => {
    setSelection((previous) => {
      const nextRight = { ...previous.right, index }

      if (nextRight.index < previous.left.index) {
        return previous
      }

      if (getMidiFromState(nextRight) <= getMidiFromState(previous.left)) {
        return previous
      }

      return {
        ...previous,
        right: nextRight,
      }
    })
  }

  const setLeftAccidental = (accidental: -1 | 0 | 1) => {
    setSelection((previous) => {
      const nextLeft = { ...previous.left, accidental }

      if (getMidiFromState(nextLeft) >= getMidiFromState(previous.right)) {
        return previous
      }

      return {
        ...previous,
        left: nextLeft,
      }
    })
  }

  const setRightAccidental = (accidental: -1 | 0 | 1) => {
    setSelection((previous) => {
      const nextRight = { ...previous.right, accidental }

      if (getMidiFromState(nextRight) <= getMidiFromState(previous.left)) {
        return previous
      }

      return {
        ...previous,
        right: nextRight,
      }
    })
  }

  const leftNote = NOTE_STEPS[leftIndex]
  const rightNote = NOTE_STEPS[rightIndex]
  const leftPitchLabel = getPitchLabelFromState(leftState)
  const rightPitchLabel = getPitchLabelFromState(rightState)

  const staffWidth = Math.max(180, Math.min(screenWidth - 152, 420))

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Range"
        subtitle="Use the sliders and buttons to select your range"
        onBack={() => router.back()}
        onNext={() => {
          const leftMidi = pitchLabelToMidi(leftPitchLabel)
          const rightMidi = pitchLabelToMidi(rightPitchLabel)
          const lowPitch =
            leftMidi <= rightMidi ? leftPitchLabel : rightPitchLabel
          const highPitch =
            leftMidi <= rightMidi ? rightPitchLabel : leftPitchLabel

          updateDraft({
            range: {
              low: lowPitch,
              high: highPitch,
            },
          })
          router.push("/choose-mode")
        }}
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingTop: 24,
          paddingBottom: 16,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <VerticalNoteSlider
              value={leftIndex}
              min={0}
              max={NOTE_STEPS.length - 1}
              upperLimit={rightIndex}
              onValueChange={setLeftIndex}
              topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
              bottomLabel={NOTE_STEPS[0].label}
            />
            <AccidentalControls
              value={leftAccidental}
              onChange={setLeftAccidental}
            />
          </View>

          <View style={{ flex: 1, alignItems: "center", gap: 12 }}>
            <RangeStaff
              width={staffWidth}
              leftNoteKey={formatManualAccidentalVexflowKey(
                leftNote.label,
                leftAccidental,
              )}
              rightNoteKey={formatManualAccidentalVexflowKey(
                rightNote.label,
                rightAccidental,
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
              <Text style={{ fontWeight: "600" }}>Left: {leftPitchLabel}</Text>
              <Text style={{ fontWeight: "600" }}>
                Right: {rightPitchLabel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <AccidentalControls
              value={rightAccidental}
              onChange={setRightAccidental}
            />
            <VerticalNoteSlider
              value={rightIndex}
              min={0}
              max={NOTE_STEPS.length - 1}
              lowerLimit={leftIndex}
              onValueChange={setRightIndex}
              topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
              bottomLabel={NOTE_STEPS[0].label}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
