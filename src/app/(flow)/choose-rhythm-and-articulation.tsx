import { useRouter } from "expo-router"
import { useState } from "react"
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { SLUR_PATTERN_OPTIONS, SlurPatternId } from "@/core/flows"

import SlurPatternStaff from "@/components/SlurPatternStaff"
import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

export default function ChooseRhythm() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const { width: screenWidth } = useWindowDimensions()
  const [selectedPatterns, setSelectedPatterns] = useState<Set<SlurPatternId>>(
    new Set(draft.slurPatternIds),
  )
  const staffWidth = Math.max(220, Math.min(screenWidth - 108, 560))

  const togglePattern = (patternId: SlurPatternId) => {
    setSelectedPatterns((previous) => {
      const next = new Set(previous)

      if (next.has(patternId)) {
        next.delete(patternId)
      } else {
        next.add(patternId)
      }

      return next
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Rhythm and Articulation"
        subtitle="Select all that apply"
        onBack={() => router.back()}
        onNext={() => {
          updateDraft({ slurPatternIds: [...selectedPatterns] })
          router.push("/name-flow")
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 14,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator
      >
        <View style={{ gap: 10 }}>
          {SLUR_PATTERN_OPTIONS.map((pattern) => {
            const isSelected = selectedPatterns.has(pattern.id)

            return (
              <Pressable
                key={pattern.id}
                onPress={() => togglePattern(pattern.id)}
                style={{
                  backgroundColor: isSelected ? "#f6f6f6" : "#fff",
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? "#000" : "#9c9c9c",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected ? (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: "#000",
                        }}
                      />
                    ) : null}
                  </View>

                  <View style={{ flex: 1, gap: 6 }}>
                    <SlurPatternStaff
                      width={staffWidth}
                      slurSpans={pattern.slurSpans}
                    />
                  </View>
                </View>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
