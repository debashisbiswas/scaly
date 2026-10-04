import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Pressable, ScrollView, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { LinearGradient } from "expo-linear-gradient"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import { MenuView } from "@expo/ui/community/menu"
import { SafeAreaView } from "react-native-safe-area-context"

import { Flow } from "@/core/flows"
import { Exercise } from "@/core/flows/exercise"
import { ExercisePracticeStats } from "@/core/flows/exercisePracticeStats"
import { useFlowStore } from "@/providers/FlowStoreProvider"

type LibraryTab = "saved" | "premade"
type FlowMasterySummary = { kind: "new" } | { kind: "graded"; percent: number }

const RATING_SCORES: Record<ExercisePracticeStats.Rating, number> = {
  easy: 100,
  good: 80,
  hard: 45,
  again: 15,
}

const liquidGlassAvailable = isLiquidGlassAvailable()

function PanelIconButton({
  accessibilityLabel,
  children,
  disabled,
  filled,
  onPress,
}: {
  accessibilityLabel: string
  children: React.ReactNode
  disabled?: boolean
  filled?: boolean
  onPress?: () => void
}) {
  return (
    <GlassView
      glassEffectStyle="regular"
      isInteractive={!disabled}
      tintColor={filled ? "#636366" : undefined}
      style={{
        width: 42,
        height: 42,
        borderRadius: 21,
        overflow: "hidden",
        backgroundColor: liquidGlassAvailable
          ? "transparent" // liquid glass background
          : filled
            ? "#636366" // fill color
            : "rgba(255, 255, 255, 0.78)", // non-liquid glass background
        borderWidth: 0,
        borderColor: "rgba(107, 122, 143, 0.24)",
      }}
    >
      <Pressable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.35 : pressed ? 0.55 : 1,
        })}
      >
        {children}
      </Pressable>
    </GlassView>
  )
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
  const { flows, premadeFlows, startEditingFlow, deleteFlow, deleteFlows } =
    useFlowStore()
  const [activeTab, setActiveTab] = useState<LibraryTab>("saved")
  const [selectMode, setSelectMode] = useState(false)
  const [selectedFlowIds, setSelectedFlowIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [deletingSelection, setDeletingSelection] = useState(false)
  const [masteryByFlowId, setMasteryByFlowId] = useState<
    Record<string, FlowMasterySummary>
  >({})

  const panelPadding = 16
  const gap = 10
  const cardWidth = "48.6%"
  const displayedFlows = activeTab === "saved" ? flows : premadeFlows
  const selectedCount = selectedFlowIds.size

  function leaveSelectMode() {
    setSelectMode(false)
    setSelectedFlowIds(new Set())
  }

  function switchTab(tab: LibraryTab) {
    leaveSelectMode()
    setActiveTab(tab)
  }

  function toggleFlowSelection(flowId: string) {
    setSelectedFlowIds((current) => {
      const next = new Set(current)

      if (next.has(flowId)) {
        next.delete(flowId)
      } else {
        next.add(flowId)
      }

      return next
    })
  }

  async function deleteSelection() {
    if (selectedCount === 0 || deletingSelection) {
      return
    }

    setDeletingSelection(true)

    try {
      await deleteFlows([...selectedFlowIds])
      leaveSelectMode()
    } catch (error) {
      console.error("[db] failed to delete flows:", error)
      Alert.alert("Couldn’t delete flows", "Please try again.")
    } finally {
      setDeletingSelection(false)
    }
  }

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

          <View
            style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => switchTab("saved")}
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
                onPress={() => switchTab("premade")}
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

            <View style={{ width: 42, height: 42, marginBottom: 5 }}>
              {activeTab === "saved" ? (
                selectMode ? (
                  <PanelIconButton
                    accessibilityLabel="Finish selecting flows"
                    filled
                    onPress={leaveSelectMode}
                  >
                    <SymbolView
                      name={{ ios: "checkmark" }}
                      fallback={
                        <Ionicons name="checkmark" color="#fff" size={23} />
                      }
                      size={21}
                      tintColor="#fff"
                      weight="bold"
                    />
                  </PanelIconButton>
                ) : (
                  <MenuView
                    actions={[
                      {
                        id: "select",
                        title: "Select",
                        image: "checkmark.circle",
                        attributes: { disabled: flows.length === 0 },
                      },
                    ]}
                    onPressAction={({ nativeEvent }) => {
                      if (nativeEvent.event === "select") {
                        setSelectMode(true)
                      }
                    }}
                  >
                    <PanelIconButton accessibilityLabel="Flow library options">
                      <SymbolView
                        name={{ ios: "ellipsis" }}
                        fallback={
                          <Ionicons
                            name="ellipsis-horizontal"
                            color="#334155"
                            size={21}
                          />
                        }
                        size={20}
                        tintColor="#334155"
                        weight="semibold"
                      />
                    </PanelIconButton>
                  </MenuView>
                )
              ) : null}
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            position: "relative",
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
            contentContainerStyle={{
              paddingBottom: selectMode ? 64 : 20,
            }}
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
                const selected = selectedFlowIds.has(flow.id)

                const cardContents = (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{ fontWeight: "700", color: "#202633", flex: 1 }}
                        numberOfLines={1}
                      >
                        {flow.name}
                      </Text>
                      {selectMode ? (
                        <View
                          style={{
                            width: 21,
                            height: 21,
                            marginLeft: 8,
                            borderRadius: 11,
                            alignItems: "center",
                            justifyContent: "center",
                            borderWidth: selected ? 0 : 2,
                            borderColor: "#98a2b3",
                            backgroundColor: selected
                              ? "#636366"
                              : "transparent",
                          }}
                        >
                          {selected ? (
                            <Text
                              style={{
                                color: "#fff",
                                fontSize: 14,
                                fontWeight: "800",
                                lineHeight: 17,
                              }}
                            >
                              ✓
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
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

                    {!selectMode ? (
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
                    ) : null}
                  </>
                )

                return selectMode ? (
                  <Pressable
                    key={`${activeTab}-${flow.id}`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${flow.name}, ${selected ? "selected" : "not selected"}`}
                    onPress={() => toggleFlowSelection(flow.id)}
                    style={{
                      width: cardWidth,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: selected ? "#636366" : "transparent",
                      backgroundColor: selected ? "#d7d9dd" : "#e0e4ea",
                      padding: 10,
                      gap: 10,
                    }}
                  >
                    {cardContents}
                  </Pressable>
                ) : (
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
                    {cardContents}
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

          {selectMode ? (
            <View
              style={{
                position: "absolute",
                right: 12,
                bottom: 12,
                zIndex: 2,
              }}
            >
              {selectedCount > 0 ? (
                <MenuView
                  actions={[
                    {
                      id: "delete",
                      title: `Delete ${selectedCount} ${selectedCount === 1 ? "flow" : "flows"}`,
                      image: "trash",
                      attributes: {
                        destructive: true,
                        disabled: deletingSelection,
                      },
                    },
                  ]}
                  onPressAction={({ nativeEvent }) => {
                    if (nativeEvent.event === "delete") {
                      void deleteSelection()
                    }
                  }}
                >
                  <PanelIconButton accessibilityLabel="Delete selected flows">
                    <SymbolView
                      name={{ ios: "trash" }}
                      fallback={
                        <Ionicons
                          name="trash-outline"
                          color="#636366"
                          size={20}
                        />
                      }
                      size={19}
                      tintColor="#636366"
                      weight="semibold"
                    />
                  </PanelIconButton>
                </MenuView>
              ) : (
                <PanelIconButton
                  accessibilityLabel="Select flows to delete"
                  disabled
                >
                  <SymbolView
                    name={{ ios: "trash" }}
                    fallback={
                      <Ionicons
                        name="trash-outline"
                        color="#667085"
                        size={20}
                      />
                    }
                    size={19}
                    tintColor="#667085"
                    weight="semibold"
                  />
                </PanelIconButton>
              )}
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  )
}
