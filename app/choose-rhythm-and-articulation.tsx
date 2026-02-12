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

import SlurPatternStaff from "./components/SlurPatternStaff"
import TopBar from "./components/TopBar"

type SlurSpan = [number, number]

type SlurPatternOption = {
  id: string
  slurSpans: SlurSpan[]
}

const SLUR_PATTERN_OPTIONS: SlurPatternOption[] = [
  {
    id: "full-phrase",
    slurSpans: [[0, 13]],
  },
  {
    id: "every-beat",
    slurSpans: [
      [0, 2],
      [3, 6],
      [7, 9],
      [10, 13],
    ],
  },
  {
    id: "tongue-1-slur-3",
    slurSpans: [
      [1, 2],
      [4, 6],
      [8, 9],
      [11, 13],
    ],
  },
]

export default function ChooseRhythm() {
  const router = useRouter()
  const { width: screenWidth } = useWindowDimensions()
  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(
    new Set(),
  )
  const staffWidth = Math.max(220, Math.min(screenWidth - 108, 560))

  const togglePattern = (patternId: string) => {
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
        onNext={() => router.push("/name-flow")}
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
        <Text
          style={{
            opacity: 0.55,
            fontSize: 12,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          Scroll to review and select one or more slur patterns.
        </Text>

        <View style={{ gap: 10 }}>
          {SLUR_PATTERN_OPTIONS.map((pattern) => {
            const isSelected = selectedPatterns.has(pattern.id)

            return (
              <Pressable
                key={pattern.id}
                onPress={() => togglePattern(pattern.id)}
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? "#000" : "#d2d2d2",
                  borderRadius: 10,
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
