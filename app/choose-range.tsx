import { useRouter } from "expo-router"
import { useState } from "react"
import { Text, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import RangeStaff from "./components/RangeStaff"
import TopBar from "./components/TopBar"
import VerticalNoteSlider from "./components/VerticalNoteSlider"

const NOTE_NAMES = ["C", "D", "E", "F", "G", "A", "B"] as const

type NoteStep = {
  label: string
  vexflowKey: string
}

const NOTE_STEPS: NoteStep[] = []

for (let octave = 3; octave <= 6; octave += 1) {
  for (const noteName of NOTE_NAMES) {
    if (octave === 6 && noteName !== "C") {
      continue
    }

    NOTE_STEPS.push({
      label: `${noteName}${octave}`,
      vexflowKey: `${noteName.toLowerCase()}/${octave}`,
    })
  }
}

export default function ChooseKey() {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const [leftIndex, setLeftIndex] = useState(4)
  const [rightIndex, setRightIndex] = useState(16)

  const leftNote = NOTE_STEPS[leftIndex]
  const rightNote = NOTE_STEPS[rightIndex]

  const staffWidth = Math.max(180, Math.min(screenWidth - 152, 420))

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Range"
        subtitle="Use the two sliders to select your highest and lowest range"
        onBack={() => router.back()}
        onNext={() => router.push("/choose-mode")}
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
          <VerticalNoteSlider
            value={leftIndex}
            min={0}
            max={NOTE_STEPS.length - 1}
            onValueChange={setLeftIndex}
            topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
            bottomLabel={NOTE_STEPS[0].label}
          />

          <View style={{ flex: 1, alignItems: "center", gap: 12 }}>
            <RangeStaff
              width={staffWidth}
              leftNoteKey={leftNote.vexflowKey}
              rightNoteKey={rightNote.vexflowKey}
            />

            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ fontWeight: "600" }}>Left: {leftNote.label}</Text>
              <Text style={{ fontWeight: "600" }}>
                Right: {rightNote.label}
              </Text>
            </View>
          </View>

          <VerticalNoteSlider
            value={rightIndex}
            min={0}
            max={NOTE_STEPS.length - 1}
            onValueChange={setRightIndex}
            topLabel={NOTE_STEPS[NOTE_STEPS.length - 1].label}
            bottomLabel={NOTE_STEPS[0].label}
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
