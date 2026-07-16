import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { SafeAreaView } from "react-native-safe-area-context"

import { Flow } from "@/core/flows"
import { Exercise } from "@/core/flows/Exercise"
import { ExercisePracticeStats } from "@/core/flows/ExercisePracticeStats"
import { useFlowStore } from "@/providers/FlowStoreProvider"

type LibraryTab = "saved" | "premade"
type FlowMasterySummary = { kind: "new" } | { kind: "graded"; percent: number }

const RATING_SCORES: Record<ExercisePracticeStats.Rating, number> = {
  easy: 100,
  good: 80,
  hard: 45,
  again: 15,
}

async function loadFlowMastery(flow: Flow): Promise<FlowMasterySummary> {
  const exercises = await Exercise.list(flow.id)

  if (exercises.length === 0) {
    return { kind: "new" }
  }

  const stats = await ExercisePracticeStats.listByExerciseIDs(
    exercises.map((exercise) => exercise.id),
  )
  const practicedStats = stats.filter((stat) => stat.lastRating !== null)

  if (practicedStats.length === 0) {
    return { kind: "new" }
  }

  const totalScore = practicedStats.reduce((sum, stat) => {
    if (!stat.lastRating) {
      return sum
    }

    return sum + RATING_SCORES[stat.lastRating]
  }, 0)
  const percent = Math.round(totalScore / practicedStats.length)

  return {
    kind: "graded",
    percent,
  }
}

function ActionButton({
  label,
  primary,
  destructive,
  onPress,
}: {
  label: string
  primary?: boolean
  destructive?: boolean
  onPress: () => void
}) {
  const backgroundColor = primary
    ? "#3f83ef"
    : destructive
      ? "#ef4444"
      : "#d1d5db"
  const color = primary || destructive ? "#fff" : "#5e6772"

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
        backgroundColor,
      }}
    >
      <Text style={{ color, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  )
}

export default function FlowLibrary() {
  const router = useRouter()
  const { flows, premadeFlows, startEditingFlow, deleteFlow } = useFlowStore()
  const [activeTab, setActiveTab] = useState<LibraryTab>("saved")
  const [masteryByFlowId, setMasteryByFlowId] = useState<
    Record<string, FlowMasterySummary>
  >({})

  const panelPadding = 16
  const gap = 10
  const cardWidth = "48.6%"
  const displayedFlows = activeTab === "saved" ? flows : premadeFlows

  useFocusEffect(
    useCallback(() => {
      async function loadDisplayedFlowMastery() {
        const summaries = await Promise.all(
          displayedFlows.map(async (flow) => [
            flow.id,
            await loadFlowMastery(flow),
          ]),
        )

        setMasteryByFlowId(Object.fromEntries(summaries))
      }

      loadDisplayedFlowMastery()
    }, [displayedFlows]),
  )

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
            onPress={() => router.replace("/")}
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
              {displayedFlows.map((flow) => {
                const mastery = masteryByFlowId[flow.id] ?? { kind: "new" }
                const masteryPercent =
                  mastery.kind === "graded" ? mastery.percent : 0

                return (
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
                          width: `${masteryPercent}%`,
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
                          {masteryPercent}%
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <ActionButton
                        label="Play"
                        primary
                        onPress={() => router.push(`/practice/${flow.id}`)}
                      />
                      {activeTab === "saved" ? (
                        <>
                          <ActionButton
                            label="Edit"
                            onPress={() => {
                              startEditingFlow(flow)
                              router.push("/choose-keys")
                            }}
                          />
                          <ActionButton
                            label="Delete"
                            destructive
                            onPress={() => {
                              Alert.alert(
                                `Delete “${flow.name}”?`,
                                "This can’t be undone.",
                                [
                                  { text: "Cancel", style: "cancel" },
                                  {
                                    text: "Delete",
                                    style: "destructive",
                                    onPress: () => void deleteFlow(flow.id),
                                  },
                                ],
                              )
                            }}
                          />
                        </>
                      ) : null}
                    </View>
                  </View>
                )
              })}
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
