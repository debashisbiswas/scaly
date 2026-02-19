import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

import { Flow } from "@/core/flows"

import { useFlowStore } from "@/providers/FlowStoreProvider"

type LibraryTab = "saved" | "premade"

const PREMADE_FLOWS = [
  { id: "flow-1", name: "First-year jury 2026", progress: 52 },
  { id: "flow-2", name: "Triple-tonguing rhythms", progress: 41 },
  { id: "flow-3", name: "All sharps", progress: 76 },
  { id: "flow-4", name: "Third-octave scales", progress: 29 },
]

function flowToCard(flow: Flow) {
  return {
    id: flow.id,
    name: flow.name,
    progress: flow.progressPercent,
  }
}

function ActionButton({
  label,
  primary,
  onPress,
}: {
  label: string
  primary?: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minWidth: 88,
        alignItems: "center",
        borderRadius: 8,
        paddingVertical: 9,
        paddingHorizontal: 14,
        backgroundColor: primary ? "#3f83ef" : "#d1d5db",
      }}
    >
      <Text style={{ color: primary ? "#fff" : "#5e6772", fontWeight: "600" }}>
        {label}
      </Text>
    </Pressable>
  )
}

export default function FlowLibrary() {
  const router = useRouter()
  const { flows } = useFlowStore()
  const [activeTab, setActiveTab] = useState<LibraryTab>("saved")

  const panelPadding = 16
  const gap = 10
  const cardWidth = "48.6%"
  const displayedFlows =
    activeTab === "saved" ? flows.map(flowToCard) : PREMADE_FLOWS

  return (
    <LinearGradient
      colors={["#90a1b9", "#7097d2"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: -1,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 34, color: "#202737", lineHeight: 34 }}>
              {"←"}
            </Text>
          </Pressable>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => setActiveTab("saved")}
              style={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                backgroundColor:
                  activeTab === "saved"
                    ? "#ebeef3"
                    : "rgba(236, 243, 250, 0.78)",
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: "#7a8494", fontWeight: "600" }}>
                Saved Flows
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab("premade")}
              style={{
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
                backgroundColor:
                  activeTab === "premade"
                    ? "#ebeef3"
                    : "rgba(236, 243, 250, 0.78)",
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}
            >
              <Text style={{ color: "#7a8494", fontWeight: "600" }}>
                Premade Flows
              </Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#ebeef3",
            borderWidth: 1,
            borderColor: "#d4dce6",
            borderRadius: 4,
            paddingHorizontal: panelPadding,
            paddingTop: 16,
            paddingBottom: 16,
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
                rowGap: gap,
              }}
            >
              {displayedFlows.map((flow) => (
                <View
                  key={`${activeTab}-${flow.id}`}
                  style={{
                    width: cardWidth,
                    borderRadius: 12,
                    backgroundColor: "#e0e4ea",
                    padding: 10,
                    gap: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{ fontWeight: "700", color: "#202633" }}
                      numberOfLines={1}
                    >
                      {flow.name}
                    </Text>
                    <Text style={{ color: "#a2aab6", fontSize: 17 }}>★</Text>
                  </View>

                  <View
                    style={{
                      height: 18,
                      borderRadius: 6,
                      backgroundColor: "#d2d6dc",
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${flow.progress}%`,
                        backgroundColor: "#1fb785",
                        justifyContent: "center",
                        paddingLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        {flow.progress}%
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <ActionButton
                      label="Play"
                      primary
                      onPress={() => router.push("/practice")}
                    />
                    <ActionButton
                      label="Edit"
                      onPress={() => console.log(`Edit flow: ${flow.name}`)}
                    />
                  </View>
                </View>
              ))}
            </View>

            {activeTab === "saved" && displayedFlows.length === 0 ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <Text style={{ color: "#667085", fontWeight: "600" }}>
                  No saved flows yet.
                </Text>
                <Text style={{ color: "#667085", marginTop: 4 }}>
                  Create one from the home screen.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
