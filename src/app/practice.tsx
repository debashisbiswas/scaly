import { useRouter } from "expo-router"
import { useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import PracticeStaff from "@/components/PracticeStaff"

const FEEDBACK_BUTTONS = [
  { label: "Again", color: "#9199a6" },
  { label: "Hard", color: "#ef4f57" },
  { label: "Good", color: "#f2ba19" },
  { label: "Easy", color: "#18b57b" },
]

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

export default function Practice() {
  const router = useRouter()
  const [showNotes, setShowNotes] = useState(true)
  const [mainPanelWidth, setMainPanelWidth] = useState(0)
  const [rhythmPreviewWidth, setRhythmPreviewWidth] = useState(0)

  const pageHorizontalPadding = 14
  const sideRailWidth = 74
  const contentGap = 10

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#eff1f4" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: pageHorizontalPadding,
          paddingTop: 4,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#8a919d",
            marginBottom: 10,
          }}
        >
          After playing the scale, mark how challenging it was below
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 18,
            gap: contentGap,
          }}
        >
          <View
            style={{ flex: 1, minWidth: 0 }}
            onLayout={(event) => {
              setMainPanelWidth(event.nativeEvent.layout.width)
            }}
          >
            <View
              style={{
                backgroundColor: "#d9dde4",
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#cbd1da",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingTop: 6,
                  paddingBottom: 8,
                  alignItems: "flex-start",
                }}
              >
                <Pressable
                  onPress={() => router.back()}
                  style={{ width: 36, height: 28, justifyContent: "center" }}
                >
                  <Ionicons name="arrow-back" size={32} color="#252e3c" />
                </Pressable>
              </View>

              {showNotes ? (
                <PracticeStaff
                  mode="full"
                  width={Math.max(0, mainPanelWidth - 2)}
                  height={214}
                />
              ) : (
                <View style={{ paddingHorizontal: 10, paddingBottom: 12 }}>
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={{ fontSize: 12, color: "#777f8c" }}>
                        Start
                      </Text>
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor: "#aeb4bd",
                          minHeight: 82,
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

                    <View style={{ flex: 1.4, gap: 4 }}>
                      <Text style={{ fontSize: 12, color: "#777f8c" }}>
                        Note
                      </Text>
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor: "#aeb4bd",
                          minHeight: 34,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "700", color: "#1f2835" }}>
                          C Major
                        </Text>
                      </View>

                      <Text
                        style={{ fontSize: 12, color: "#777f8c", marginTop: 4 }}
                      >
                        Rhythm and Articulation
                      </Text>

                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor: "#cfd4dc",
                          overflow: "hidden",
                        }}
                        onLayout={(event) => {
                          setRhythmPreviewWidth(event.nativeEvent.layout.width)
                        }}
                      >
                        <PracticeStaff
                          mode="rhythm"
                          width={Math.max(0, rhythmPreviewWidth)}
                          height={94}
                        />
                      </View>
                    </View>

                    <View style={{ flex: 1.2, gap: 4 }}>
                      <Text style={{ fontSize: 12, color: "#777f8c" }}>
                        Octave
                      </Text>
                      <View
                        style={{
                          borderRadius: 8,
                          backgroundColor: "#aeb4bd",
                          minHeight: 34,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text style={{ fontWeight: "700", color: "#1f2835" }}>
                          1 Octave
                        </Text>
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
              paddingTop: 10,
              alignItems: "center",
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

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            paddingHorizontal: 8,
            marginTop: "auto",
            marginBottom: 20,
          }}
        >
          {FEEDBACK_BUTTONS.map((button) => (
            <Pressable
              key={button.label}
              style={{
                width: 66,
                height: 66,
                borderRadius: 33,
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
      </View>
    </SafeAreaView>
  )
}
