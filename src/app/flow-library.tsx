import { useFocusEffect, useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Alert, Pressable, Text, View } from "react-native"
import Ionicons from "@expo/vector-icons/Ionicons"
import { LinearGradient } from "expo-linear-gradient"
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect"
import { SymbolView } from "expo-symbols"
import { MenuView } from "@expo/ui/community/menu"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"

import { Flow } from "@/core/flows"
import { Exercise } from "@/core/flows/exercise"
import { ExercisePracticeStats } from "@/core/flows/exercisePracticeStats"
import {
  FlowLibraryCard,
  type FlowMasterySummary,
} from "@/components/FlowLibraryCard"
import { SortableGrid } from "@/components/SortableGrid"
import { useFlowStore } from "@/providers/FlowStoreProvider"

type LibraryTab = "saved" | "premade"

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
  const ratings = stats
    .map((stat) => stat.lastRating)
    .filter((rating) => rating !== null)

  if (ratings.length === 0) {
    return { kind: "new" }
  }

  const totalScore = ratings.reduce(
    (sum, rating) => sum + RATING_SCORES[rating],
    0,
  )
  const percent = Math.round(totalScore / ratings.length)

  return {
    kind: "graded",
    percent,
  }
}

export default function FlowLibrary() {
  const router = useRouter()
  const { bottom: bottomInset } = useSafeAreaInsets()
  const {
    flows,
    premadeFlows,
    startEditingFlow,
    deleteFlow,
    deleteFlows,
    reorderFlows,
  } = useFlowStore()
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
  const gap = 14
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

  function reorderSavedFlows(orderedIds: string[]) {
    void reorderFlows(orderedIds).catch((error) => {
      console.error("[storage] failed to reorder flows:", error)
      Alert.alert("Couldn’t reorder flows", "Please try again.")
    })
  }

  useFocusEffect(
    useCallback(() => {
      let active = true

      async function loadDisplayedFlowMastery() {
        const summaries = await Promise.all(
          displayedFlows.map(async (flow) => {
            try {
              return [flow.id, await loadFlowMastery(flow)] as const
            } catch (error) {
              console.error("[db] failed to load flow mastery:", error)
              return [flow.id, { kind: "unavailable" }] as const
            }
          }),
        )

        if (active) setMasteryByFlowId(Object.fromEntries(summaries))
      }

      void loadDisplayedFlowMastery()
      return () => {
        active = false
      }
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
        edges={["top", "left", "right"]}
        style={{ flex: 1, paddingTop: 6 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <View style={{ width: 42, height: 42, marginBottom: 5 }}>
            <PanelIconButton
              accessibilityLabel="Back"
              onPress={() => router.replace("/")}
            >
              <SymbolView
                name={{ ios: "chevron.left" }}
                fallback={
                  <Ionicons name="chevron-back" color="#334155" size={22} />
                }
                size={19}
                tintColor="#334155"
                weight="semibold"
              />
            </PanelIconButton>
          </View>

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
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: "hidden",
          }}
        >
          <SortableGrid
            data={displayedFlows}
            enabled={activeTab === "saved" && !selectMode}
            itemHeight={selectMode ? 72 : 184}
            columnGap={gap}
            rowGap={gap}
            contentHorizontalPadding={panelPadding}
            contentTopPadding={14}
            contentBottomPadding={bottomInset + (selectMode ? 64 : 20)}
            onReorder={reorderSavedFlows}
            renderItem={(flow) => {
              const cardProps = {
                flow,
                mastery: masteryByFlowId[flow.id],
              }

              return selectMode ? (
                <FlowLibraryCard
                  {...cardProps}
                  selected={selectedFlowIds.has(flow.id)}
                  onSelect={() => toggleFlowSelection(flow.id)}
                />
              ) : (
                <FlowLibraryCard
                  {...cardProps}
                  onPlay={() => router.push(`/practice/${flow.id}`)}
                  {...(activeTab === "saved"
                    ? {
                        onEdit: () => {
                          startEditingFlow(flow)
                          router.push("/choose-keys")
                        },
                        onDelete: () => {
                          Alert.alert(
                            `Delete “${flow.name}”?`,
                            "This can’t be undone.",
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => {
                                  void deleteFlow(flow.id).catch((error) => {
                                    console.error(
                                      "[db] failed to delete flow:",
                                      error,
                                    )
                                    Alert.alert(
                                      "Couldn’t delete flow",
                                      "Please try again.",
                                    )
                                  })
                                },
                              },
                            ],
                          )
                        },
                      }
                    : {})}
                />
              )
            }}
          />

          {activeTab === "saved" && displayedFlows.length === 0 ? (
            <View
              style={{
                position: "absolute",
                top: 24,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#667085", fontWeight: "600" }}>
                No saved flows yet.
              </Text>
              <Text style={{ color: "#667085", marginTop: 4 }}>
                Create one from the home screen.
              </Text>
            </View>
          ) : null}

          {selectMode ? (
            <View
              style={{
                position: "absolute",
                right: 12,
                bottom: bottomInset + 12,
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
