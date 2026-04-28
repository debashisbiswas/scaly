import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import {
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import PracticeStaff from "@/components/PracticeStaff"
import {
  GeneratedExerciseSpec,
  expandFlowDraftToExerciseSpecs,
} from "@/core/flows"
import { Exercise } from "@/core/flows/Exercise"
import { ExercisePracticeStats } from "@/core/flows/ExercisePracticeStats"
import { toExerciseKey } from "@/core/flows/exerciseKey"
import { useFlowStore } from "@/providers/FlowStoreProvider"

type PracticeExercise = {
  id: string | null
  exerciseKey: string
  spec: GeneratedExerciseSpec
  stats: ExercisePracticeStats.Shape | null
  assignedTempo: number
}

function DebugQueueSidebar(props: {
  queue: PracticeExercise[]
  currentExerciseIndex: number
  flowConfig: unknown
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { width: screenWidth } = useWindowDimensions()
  const panelWidth = Math.max(240, Math.floor(screenWidth * 0.5))

  useEffect(() => {
    console.log("[practice] debug sidebar rendered")
    console.log("[practice] queue", JSON.stringify(props.queue, null, 2))
    console.log("[practice] flow config", props.flowConfig)
  }, [props.queue, props.flowConfig])

  const formatDebugValue = (value: unknown): string => {
    if (value === null) {
      return "null"
    }

    if (value === undefined) {
      return "undefined"
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "[]"
      }

      return value.map((item) => formatDebugValue(item)).join(", ")
    }

    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        return "{}"
      }

      return entries
        .slice(0, 4)
        .map(([key, nestedValue]) => `${key}: ${formatDebugValue(nestedValue)}`)
        .join(" | ")
    }

    return String(value)
  }

  const flowConfigEntries =
    props.flowConfig && typeof props.flowConfig === "object"
      ? Object.entries(props.flowConfig as Record<string, unknown>)
      : []

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 100,
        flexDirection: "row",
        zIndex: 50,
      }}
    >
      <Pressable
        onPress={() => setIsOpen((previous) => !previous)}
        style={{
          width: 32,
          marginTop: 10,
          marginBottom: 10,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          backgroundColor: "#cfd8e3",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons
          name={isOpen ? "chevron-forward" : "chevron-back"}
          size={18}
          color="#425066"
        />
      </Pressable>

      {isOpen ? (
        <View
          style={{
            width: panelWidth,
            backgroundColor: "#f8fafc",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
            borderLeftWidth: 1,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: "#d1dae6",
            padding: 10,
            gap: 8,
          }}
        >
          <Text style={{ color: "#2b3a4f", fontSize: 12, fontWeight: "700" }}>
            Current exercise queue ({props.queue.length} exercises)
          </Text>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
          >
            <View
              style={{
                borderRadius: 8,
                padding: 8,
                borderWidth: 1,
                borderColor: "#d7e0eb",
                backgroundColor: "#ffffff",
                gap: 6,
              }}
            >
              <Text
                style={{ color: "#1f2a37", fontSize: 12, fontWeight: "700" }}
              >
                Flow configuration
              </Text>

              {flowConfigEntries.length === 0 ? (
                <Text style={{ color: "#5c6b7d", fontSize: 11 }}>
                  No flow config found
                </Text>
              ) : (
                <View style={{ gap: 6 }}>
                  {flowConfigEntries.map(([configKey, configValue]) => (
                    <View
                      key={configKey}
                      style={{
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: "#e2e8f0",
                        backgroundColor: "#f8fbff",
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#3c6fa7",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {configKey}
                      </Text>
                      <Text style={{ color: "#3d4c5f", fontSize: 11 }}>
                        {formatDebugValue(configValue)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <Text style={{ color: "#2b3a4f", fontSize: 12, fontWeight: "700" }}>
              Generated exercise queue
            </Text>

            {props.queue.map((queuedExercise, index) => {
              const stats = queuedExercise.stats
              const weight =
                ExercisePracticeStats.getExercisePracticeWeight(stats)
              const octaveCount = queuedExercise.spec.octaves
              const octaveLabel = `${octaveCount} Octave${octaveCount === 1 ? "" : "s"}`

              return (
                <View
                  key={`${queuedExercise.exerciseKey}-${index}`}
                  style={{
                    borderRadius: 8,
                    padding: 8,
                    backgroundColor:
                      index === props.currentExerciseIndex
                        ? "#e7f1ff"
                        : "#ffffff",
                    borderWidth: 1,
                    borderColor:
                      index === props.currentExerciseIndex
                        ? "#69a7f7"
                        : "#d7e0eb",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#1f2a37",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    #{index + 1} {queuedExercise.spec.key}{" "}
                    {getModeLabel(queuedExercise.spec.mode)}
                  </Text>
                  <Text style={{ color: "#3c6fa7", fontSize: 12 }}>
                    Tempo: {queuedExercise.assignedTempo} BPM, {octaveLabel},
                    start on {queuedExercise.spec.key}
                    {queuedExercise.spec.startOctave}
                  </Text>
                  <Text style={{ color: "#5c6b7d", fontSize: 11 }}>
                    weight given to this exercise during random selection:{" "}
                    {weight.toFixed(3)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 6,
                    }}
                  >
                    <View
                      style={{
                        minWidth: 72,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#9199a6",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {stats?.againCount ?? 0}
                      </Text>
                    </View>
                    <View
                      style={{
                        minWidth: 72,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#ef4f57",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {stats?.hardCount ?? 0}
                      </Text>
                    </View>
                    <View
                      style={{
                        minWidth: 72,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#f2ba19",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {stats?.goodCount ?? 0}
                      </Text>
                    </View>
                    <View
                      style={{
                        minWidth: 72,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#18b57b",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        {stats?.easyCount ?? 0}
                      </Text>
                    </View>
                    <View
                      style={{
                        minWidth: 72,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 999,
                        backgroundColor: "#dbe3ee",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#4d5a6b",
                          fontSize: 11,
                          fontWeight: "700",
                        }}
                      >
                        total {stats?.totalAttempts ?? 0}
                      </Text>
                    </View>
                  </View>
                </View>
              )
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  )
}

function SideToggleButton(props: {
  label: string
  active?: boolean
  icon: keyof typeof Ionicons.glyphMap
  onPress?: () => void
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        alignItems: "center",
        gap: 4,
        opacity: props.active || props.onPress ? 1 : 0.65,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: props.active ? "#b7bfcb" : "#d6dbe3",
        }}
      >
        <Ionicons name={props.icon} size={20} color="#8992a0" />
      </View>
      <Text
        style={{
          fontSize: 15,
          color: "#7c8491",
          fontWeight: props.active ? "600" : "500",
        }}
      >
        {props.label}
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

function DifficultyButtons(props: {
  onRate: (rating: ExercisePracticeStats.Rating) => void
  disabled?: boolean
}) {
  const buttons = [
    { label: "Again", color: "#9199a6", rating: "again" as const },
    { label: "Hard", color: "#ef4f57", rating: "hard" as const },
    { label: "Good", color: "#f2ba19", rating: "good" as const },
    { label: "Easy", color: "#18b57b", rating: "easy" as const },
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
          disabled={props.disabled}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: button.color,
            opacity: props.disabled ? 0.5 : 1,
          }}
          onPress={() => props.onRate(button.rating)}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {button.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

function ExercisePropertyView(props: { title: string; text: string }) {
  return (
    <>
      <Text style={{ fontSize: 12, color: "#777f8c" }}>{props.title}</Text>
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
          {props.text}
        </Text>
      </View>
    </>
  )
}

function getModeLabel(mode: GeneratedExerciseSpec["mode"]) {
  if (mode === "major") {
    return "Major"
  }

  if (mode === "minor") {
    return "Natural Minor"
  }

  if (mode === "harmonic minor") {
    return "Harmonic Minor"
  }

  return "Melodic Minor"
}

function pickWeightedExerciseIndex(
  exercises: PracticeExercise[],
  currentIndex: number,
) {
  if (exercises.length === 0) {
    return -1
  }

  if (exercises.length === 1) {
    return 0
  }

  const weightedCandidates = exercises
    .map((exercise, index) => ({
      index,
      weight: ExercisePracticeStats.getExercisePracticeWeight(exercise.stats),
    }))
    .filter((candidate) => candidate.index !== currentIndex)

  const totalWeight = weightedCandidates.reduce(
    (sum, candidate) => sum + candidate.weight,
    0,
  )

  if (totalWeight <= 0) {
    return (currentIndex + 1) % exercises.length
  }

  const target = Math.random() * totalWeight
  let runningWeight = 0

  for (const candidate of weightedCandidates) {
    runningWeight += candidate.weight

    if (target <= runningWeight) {
      return candidate.index
    }
  }

  return weightedCandidates[weightedCandidates.length - 1]?.index ?? 0
}

export default function Practice() {
  const [showNotes, setShowNotes] = useState(false)
  const [mainPanelWidth, setMainPanelWidth] = useState(0)
  const [mainPanelHeight, setMainPanelHeight] = useState(0)

  const { id } = useLocalSearchParams<{ id: string }>()
  const { getFlowById } = useFlowStore()
  const [exerciseQueue, setExerciseQueue] = useState<PracticeExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isLoadingExercise, setIsLoadingExercise] = useState(true)
  const [isSavingRating, setIsSavingRating] = useState(false)

  const flow = typeof id === "string" ? getFlowById(id) : undefined

  useEffect(() => {
    let cancelled = false

    async function loadExerciseSpec() {
      if (typeof id !== "string") {
        setExerciseQueue([])
        setCurrentExerciseIndex(0)
        setIsLoadingExercise(false)
        return
      }

      setIsLoadingExercise(true)

      if (!flow) {
        if (!cancelled) {
          setExerciseQueue([])
          setCurrentExerciseIndex(0)
          setIsLoadingExercise(false)
        }
        return
      }

      try {
        const generated = expandFlowDraftToExerciseSpecs(flow.config)
        const storedExercises = await Exercise.list(id)
        const storedExerciseIds = storedExercises.map((exercise) => exercise.id)
        const storedStats =
          await ExercisePracticeStats.listByExerciseIDs(storedExerciseIds)
        const exerciseIdByKey = new Map(
          storedExercises.map((exercise) => [
            exercise.exerciseKey,
            exercise.id,
          ]),
        )
        const statsByExerciseId = new Map(
          storedStats.map((stats) => [stats.exerciseId, stats]),
        )

        console.log("[practice] loaded candidate exercises", {
          flowId: id,
          source: "flow-config",
          candidateCount: generated.length,
          persistedExerciseCount: storedExercises.length,
          persistedStatsCount: storedStats.length,
        })

        if (!cancelled) {
          setExerciseQueue(
            generated.map((spec) => {
              const exerciseKey = toExerciseKey(spec)
              const storedExerciseId = exerciseIdByKey.get(exerciseKey) ?? null

              const assignedTempo =
                spec.tempo.kind === "single"
                  ? spec.tempo.bpm
                  : Math.ceil(
                      Math.random() * (spec.tempo.maxBpm - spec.tempo.minBpm) +
                        spec.tempo.minBpm,
                    )

              return {
                id: storedExerciseId,
                exerciseKey,
                spec,
                stats:
                  storedExerciseId !== null
                    ? (statsByExerciseId.get(storedExerciseId) ?? null)
                    : null,
                assignedTempo,
              }
            }),
          )
          setCurrentExerciseIndex(0)
        }
      } catch {
        console.log("[practice] failed to load candidate exercises", {
          flowId: id,
          source: "flow-config",
        })

        if (!cancelled) {
          setExerciseQueue([])
          setCurrentExerciseIndex(0)
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExercise(false)
        }
      }
    }

    void loadExerciseSpec()

    return () => {
      cancelled = true
    }
  }, [id, flow])

  const exercise = exerciseQueue[currentExerciseIndex] ?? null

  if (isLoadingExercise) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 32, color: "#202737" }}>
          Loading practice...
        </Text>
      </View>
    )
  }

  if (!exercise) {
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
        <Text style={{ fontSize: 48, color: "#202737" }}>
          Exercise not found
        </Text>
      </View>
    )
  }

  const octaveCount = exercise.spec.octaves

  const advanceToNextExercise = () => {
    if (exerciseQueue.length === 0) {
      return
    }

    setCurrentExerciseIndex((current) =>
      pickWeightedExerciseIndex(exerciseQueue, current),
    )
  }

  const handleRate = async (rating: ExercisePracticeStats.Rating) => {
    if (typeof id !== "string" || isSavingRating) {
      return
    }

    setIsSavingRating(true)

    try {
      const storedExercise = await Exercise.upsert(id, exercise.spec)

      if (!storedExercise) {
        throw new Error("Failed to upsert exercise.")
      }

      const nextStats = await ExercisePracticeStats.recordExerciseRating(
        storedExercise.id,
        rating,
      )

      if (!nextStats) {
        throw new Error("Failed to record exercise rating.")
      }

      setExerciseQueue((currentQueue) => {
        const nextQueue = [...currentQueue]
        const currentExercise = nextQueue[currentExerciseIndex]

        if (currentExercise) {
          nextQueue[currentExerciseIndex] = {
            ...currentExercise,
            id: storedExercise.id,
            exerciseKey: storedExercise.exerciseKey,
            stats: nextStats,
          }
        }

        return nextQueue
      })

      console.log("[practice] rating persisted", {
        flowId: id,
        exerciseId: storedExercise.id,
        exerciseKey: storedExercise.exerciseKey,
        rating,
        totalAttempts: nextStats.totalAttempts,
        action: "advance_to_next_exercise",
      })

      advanceToNextExercise()
    } catch (error) {
      console.error("[practice] failed to persist rating", {
        flowId: id,
        exerciseKey: exercise.exerciseKey,
        rating,
        error,
      })
    } finally {
      setIsSavingRating(false)
    }
  }

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
      <Text
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "#7c8491",
          marginBottom: 4,
        }}
      >
        {`Randomizing ${exerciseQueue.length} exercise${exerciseQueue.length === 1 ? "" : "s"}`}
      </Text>

      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap: 10,
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
                  exerciseSpec={exercise.spec}
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
                  <View style={{ flex: 1, gap: 12 }}>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1, gap: 4 }}>
                        <ExercisePropertyView
                          title="Key"
                          text={`${exercise.spec.key} ${getModeLabel(exercise.spec.mode)}`}
                        />
                      </View>

                      <View style={{ flex: 1, gap: 4 }}>
                        <ExercisePropertyView
                          title="Octaves"
                          text={`${octaveCount} Octave${octaveCount === 1 ? "" : "s"}`}
                        />
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <View style={{ flex: 1, gap: 4 }} />
                      <View style={{ flex: 2, gap: 4 }}>
                        <ExercisePropertyView
                          title="Tempo"
                          text={`${exercise.assignedTempo} BPM`}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 4 }} />
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View
            style={{
              width: 74,
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

        <DifficultyButtons onRate={handleRate} disabled={isSavingRating} />
      </View>

      <DebugQueueSidebar
        queue={exerciseQueue}
        currentExerciseIndex={currentExerciseIndex}
        flowConfig={flow?.config}
      />
    </SafeAreaView>
  )
}
