import { useLocalSearchParams, useRouter } from "expo-router"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import PracticeStaff from "@/components/PracticeStaff"
import { useFlowStore } from "@/providers/FlowStoreProvider"

function SideToggleButton({
  label,
  active,
  icon,
  onPress,
}: {
  label: string
  active?: boolean
  icon: keyof typeof Ionicons.glyphMap
  onPress?: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        gap: 4,
        opacity: active || onPress ? 1 : 0.65,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: active ? "#b7bfcb" : "#d6dbe3",
        }}
      >
        <Ionicons name={icon} size={20} color="#8992a0" />
      </View>
      <Text
        style={{
          fontSize: 15,
          color: "#7c8491",
          fontWeight: active ? "600" : "500",
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}

function BackButton() {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.back()}
      style={{ width: 36, height: 28, justifyContent: "center" }}
    >
      <Ionicons name="arrow-back" size={32} color="#252e3c" />
    </Pressable>
  )
}

function DifficultyButtons() {
  const buttons = [
    { label: "Again", color: "#9199a6" },
    { label: "Hard", color: "#ef4f57" },
    { label: "Good", color: "#f2ba19" },
    { label: "Easy", color: "#18b57b" },
  ]

  const buttonSize = 70

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      {buttons.map((button) => (
        <Pressable
          key={button.label}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: button.color,
          }}
          onPress={() => {
            console.log(`Selected difficulty: ${button.label}`)
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {button.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function parsePitchLabel(label: string) {
  const match = label.match(/^([A-G])([#b]?)(\d+)$/)

  if (!match) {
    return null
  }

  return {
    octave: Number(match[3]),
  }
}

function getOctaveCount(low: string, high: string) {
  const lowPitch = parsePitchLabel(low)
  const highPitch = parsePitchLabel(high)

  if (!lowPitch || !highPitch) {
    return 1
  }

  return Math.max(1, highPitch.octave - lowPitch.octave + 1)
}

export default function Practice() {
  const [showNotes, setShowNotes] = useState(true)
  const [mainPanelWidth, setMainPanelWidth] = useState(0)
  const [mainPanelHeight, setMainPanelHeight] = useState(0)
  const [rhythmPreviewWidth, setRhythmPreviewWidth] = useState(0)
  const [rhythmPreviewHeight, setRhythmPreviewHeight] = useState(0)

  const { id } = useLocalSearchParams<{ id: string }>()
  const { getFlowById } = useFlowStore()

  const flow = typeof id === "string" ? getFlowById(id) : undefined

  if (!flow) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <BackButton />
        <Text style={{ fontSize: 48, color: "#202737" }}>Flow not found</Text>
      </View>
    )
  }

  const sideRailWidth = 74
  const contentGap = 10
  const keyLabel = flow.config.keys[0] ?? "C"
  const modeLabel = flow.config.modes[0] ?? "Major"
  const octaveCount = getOctaveCount(
    flow.config.range.low,
    flow.config.range.high,
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Text
        style={{
          textAlign: "center",
          fontSize: 14,
          color: "#8a919d",
          marginVertical: 10,
        }}
      >
        After playing the scale, mark how challenging it was below
      </Text>

      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap: contentGap,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <BackButton />

          <View
            style={{ flex: 1 }}
            onLayout={(event) => {
              setMainPanelWidth(event.nativeEvent.layout.width)
              setMainPanelHeight(event.nativeEvent.layout.height)
            }}
          >
            {/* Center card */}
            <View
              style={{
                flex: 1,
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
                borderRadius: 12,
                overflow: "hidden",
                paddingHorizontal: 16,
                paddingVertical: 12,
                width: Math.max(0, mainPanelWidth - 2),
                height: Math.max(0, mainPanelHeight - 2),
              }}
            >
              {showNotes ? (
                <PracticeStaff
                  flow={flow}
                  mode="full"
                  width={Math.max(0, mainPanelWidth - 2)}
                  height={Math.max(0, mainPanelHeight - 2)}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    gap: 12,
                  }}
                >
                  <View style={{ width: 88, gap: 4 }}>
                    <Text style={{ fontSize: 12, color: "#777f8c" }}>
                      Start
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 8,
                        backgroundColor: "#E5E7EB",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="musical-note-outline"
                        size={28}
                        color="#2a3341"
                      />
                    </View>
                  </View>

                  <View style={{ flex: 1, gap: 12 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 12, color: "#777f8c" }}>
                          Key
                        </Text>
                        <View
                          style={{
                            borderRadius: 8,
                            backgroundColor: "#E5E7EB",
                            minHeight: 34,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: "#1f2835" }}>
                            {`${keyLabel} ${modeLabel}`}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={{ fontSize: 12, color: "#777f8c" }}>
                          Octaves
                        </Text>
                        <View
                          style={{
                            borderRadius: 8,
                            backgroundColor: "#E5E7EB",
                            minHeight: 34,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text style={{ fontWeight: "700", color: "#1f2835" }}>
                            {`${octaveCount} Octave${octaveCount === 1 ? "" : "s"}`}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: 12, color: "#777f8c" }}>
                        Rhythm and Articulation
                      </Text>

                      <View
                        style={{
                          flex: 1,
                          borderRadius: 8,
                          backgroundColor: "#cfd4dc",
                          overflow: "hidden",
                        }}
                        onLayout={(event) => {
                          setRhythmPreviewWidth(event.nativeEvent.layout.width)
                          setRhythmPreviewHeight(
                            event.nativeEvent.layout.height,
                          )
                        }}
                      >
                        <PracticeStaff
                          flow={flow}
                          mode="rhythm"
                          width={Math.max(0, rhythmPreviewWidth)}
                          height={Math.max(0, rhythmPreviewHeight)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              width: sideRailWidth,
              gap: 14,
              alignItems: "center",
              alignSelf: "center",
              flexShrink: 0,
            }}
          >
            <SideToggleButton
              label="Note"
              icon="eye-outline"
              active={showNotes}
              onPress={() => setShowNotes((previous) => !previous)}
            />
            <SideToggleButton label="Metro" icon="timer-outline" />
            <SideToggleButton label="Drone" icon="pulse-outline" />
          </View>
        </View>

        <DifficultyButtons />
      </View>
    </SafeAreaView>
  )
}
