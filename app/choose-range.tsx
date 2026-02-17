import { useRouter } from "expo-router"
import { useState } from "react"
import { Text, View, useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { NOTE_STEP_OPTIONS } from "@/core/flows"

import RangeStaff from "./components/RangeStaff"
import TopBar from "./components/TopBar"
import VerticalNoteSlider from "./components/VerticalNoteSlider"
import { useFlowStore } from "./providers/FlowStoreProvider"

const NOTE_STEPS = NOTE_STEP_OPTIONS

export default function ChooseKey() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const { width: screenWidth } = useWindowDimensions()
  const [leftIndex, setLeftIndex] = useState(() => {
    const index = NOTE_STEPS.findIndex((step) => step.label === draft.range.low)
    return index >= 0 ? index : 4
  })
  const [rightIndex, setRightIndex] = useState(() => {
    const index = NOTE_STEPS.findIndex(
      (step) => step.label === draft.range.high,
    )
    return index >= 0 ? index : 16
  })

  const leftNote = NOTE_STEPS[leftIndex]
  const rightNote = NOTE_STEPS[rightIndex]

  const staffWidth = Math.max(180, Math.min(screenWidth - 152, 420))

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Range"
        subtitle="Use the two sliders to select your highest and lowest range"
        onBack={() => router.back()}
        onNext={() => {
          const lowIndex = Math.min(leftIndex, rightIndex)
          const highIndex = Math.max(leftIndex, rightIndex)

          updateDraft({
            range: {
              low: NOTE_STEPS[lowIndex].label,
              high: NOTE_STEPS[highIndex].label,
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
