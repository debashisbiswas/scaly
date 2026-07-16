import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Note as TonalNote } from "tonal"
import { Host, Button } from "@expo/ui"

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
import { ExerciseQueue } from "@/core/flows/ExerciseQueue"
import { createMetronome } from "@/core/metronome"
import { createDrone } from "@/core/drone"

function DebugQueueSidebar(props: {
  queue: ExerciseQueue.PracticeExercise[]
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
                    Tempo bucket: {formatTempoBucket(queuedExercise.spec.tempo)}, {octaveLabel},
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

function TopBarButton(props: {
  label: string
  icon: keyof typeof Ionicons.glyphMap
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        minHeight: 36,
      }}
    >
      <Ionicons name={props.icon} size={22} color="#252e3c" />
      <Text style={{ fontSize: 17, color: "#252e3c", fontWeight: "600" }}>
        {props.label}
      </Text>
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

function formatTempoBucket(tempo: GeneratedExerciseSpec["tempo"]) {
  if (tempo.kind === "single") {
    return `${tempo.bpm} BPM`
  }

  return `${tempo.minBpm}–${tempo.maxBpm} BPM`
}

function assignTempo(
  exerciseTempo: GeneratedExerciseSpec["tempo"],
  flowTempo: GeneratedExerciseSpec["tempo"],
) {
  if (exerciseTempo.kind === "single") {
    return exerciseTempo.bpm
  }

  const flowMinBpm =
    flowTempo.kind === "single" ? flowTempo.bpm : flowTempo.minBpm
  const flowMaxBpm =
    flowTempo.kind === "single" ? flowTempo.bpm : flowTempo.maxBpm
  const minBpm = Math.max(exerciseTempo.minBpm, flowMinBpm)
  const maxBpm = Math.min(exerciseTempo.maxBpm, flowMaxBpm)

  if (minBpm > maxBpm) {
    return exerciseTempo.minBpm
  }

  return Math.floor(Math.random() * (maxBpm - minBpm + 1)) + minBpm
}

function assignTempoToQueueItem(
  queue: ExerciseQueue.PracticeExercise[],
  index: number,
  flowTempo: GeneratedExerciseSpec["tempo"],
) {
  const exercise = queue[index]

  if (!exercise) {
    return queue
  }

  const nextQueue = [...queue]
  nextQueue[index] = {
    ...exercise,
    assignedTempo: assignTempo(exercise.spec.tempo, flowTempo),
  }

  return nextQueue
}

export default function Practice() {
  const router = useRouter()
  const [showNotes, setShowNotes] = useState(false)
  const [mainPanelWidth, setMainPanelWidth] = useState(0)
  const [mainPanelHeight, setMainPanelHeight] = useState(0)

  const { id: flowId } = useLocalSearchParams<{ id: string }>()
  const { flows, getFlowById, startEditingFlow } = useFlowStore()
  const [exerciseQueue, setExerciseQueue] = useState<
    ExerciseQueue.PracticeExercise[]
  >([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isLoadingExercise, setIsLoadingExercise] = useState(true)
  const [isSavingRating, setIsSavingRating] = useState(false)
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false)
  const [isDroneRunning, setIsDroneRunning] = useState(false)
  const metronomeRef = useRef<ReturnType<typeof createMetronome> | null>(null)
  const droneRef = useRef<ReturnType<typeof createDrone> | null>(null)

  const flow = typeof flowId === "string" ? getFlowById(flowId) : undefined
  const savedFlow =
    typeof flowId === "string"
      ? flows.find((storedFlow) => storedFlow.id === flowId)
      : undefined

  useEffect(() => {
    async function loadExerciseSpec() {
      if (typeof flowId !== "string") {
        setExerciseQueue([])
        setCurrentExerciseIndex(0)
        setIsLoadingExercise(false)
        return
      }

      setIsLoadingExercise(true)

      if (!flow) {
        setExerciseQueue([])
        setCurrentExerciseIndex(0)
        setIsLoadingExercise(false)
        return
      }

      try {
        const generated = expandFlowDraftToExerciseSpecs(flow.config)
        const storedExercises = await Exercise.list(flowId)
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
          flowId: flowId,
          source: "flow-config",
          candidateCount: generated.length,
          persistedExerciseCount: storedExercises.length,
          persistedStatsCount: storedStats.length,
        })

        const nextQueue = generated.map((spec) => {
          const exerciseKey = toExerciseKey(spec)
          const storedExerciseId = exerciseIdByKey.get(exerciseKey) ?? null

          return {
            id: storedExerciseId,
            exerciseKey,
            spec,
            stats:
              storedExerciseId !== null
                ? (statsByExerciseId.get(storedExerciseId) ?? null)
                : null,
            assignedTempo: null,
          }
        })

        const nextExerciseIndex = ExerciseQueue.pickWeightedExerciseIndex(
          nextQueue,
          -1,
        )

        setExerciseQueue(
          assignTempoToQueueItem(
            nextQueue,
            nextExerciseIndex,
            flow.config.tempo,
          ),
        )
        setCurrentExerciseIndex(nextExerciseIndex)
      } catch {
        console.log("[practice] failed to load candidate exercises", {
          flowId: flowId,
          source: "flow-config",
        })

        setExerciseQueue([])
        setCurrentExerciseIndex(0)
      } finally {
        setIsLoadingExercise(false)
      }
    }

    loadExerciseSpec()
  }, [flowId, flow])

  const exercise = exerciseQueue[currentExerciseIndex] ?? null
  const droneFrequency = exercise
    ? (TonalNote.freq(`${exercise.spec.key.split("/")[0]}4`) ?? null)
    : null

  const handleMetronomeToggle = () => {
    if (!exercise || exercise.assignedTempo === null) {
      return
    }

    if (!metronomeRef.current) {
      metronomeRef.current = createMetronome({ bpm: exercise.assignedTempo })
    }

    setIsMetronomeRunning(metronomeRef.current.toggle())
  }

  const handleDroneToggle = () => {
    if (droneFrequency === null) {
      return
    }

    if (!droneRef.current) {
      droneRef.current = createDrone({ frequency: droneFrequency })
    }

    setIsDroneRunning(droneRef.current.toggle())
  }

  useEffect(() => {
    if (exercise && exercise.assignedTempo !== null && metronomeRef.current) {
      metronomeRef.current.setBpm(exercise.assignedTempo)
    }
  }, [exercise])

  useEffect(() => {
    if (droneFrequency !== null && droneRef.current) {
      droneRef.current.setFrequency(droneFrequency)
    }
  }, [droneFrequency])

  useEffect(
    () => () => {
      metronomeRef.current?.dispose()
      droneRef.current?.dispose()
    },
    [],
  )

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
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
        }}
      >
        <TopBarButton
          label="Back"
          icon="arrow-back"
          onPress={() => router.back()}
        />
        <Text style={{ fontSize: 48, color: "#202737" }}>
          Exercise not found
        </Text>
      </View>
    )
  }

  if (exercise.assignedTempo === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 32, color: "#202737" }}>
          Loading exercise...
        </Text>
      </View>
    )
  }

  const assignedTempo = exercise.assignedTempo
  const octaveCount = exercise.spec.octaves

  const advanceToNextExercise = (
    queue: ExerciseQueue.PracticeExercise[] = exerciseQueue,
  ) => {
    if (queue.length === 0 || !flow) {
      return
    }

    const nextExerciseIndex = ExerciseQueue.pickWeightedExerciseIndex(
      queue,
      currentExerciseIndex,
    )

    setExerciseQueue(
      assignTempoToQueueItem(queue, nextExerciseIndex, flow.config.tempo),
    )
    setCurrentExerciseIndex(nextExerciseIndex)
  }

  const handleRate = async (rating: ExercisePracticeStats.Rating) => {
    if (typeof flowId !== "string" || !flow || isSavingRating) {
      return
    }

    setIsSavingRating(true)

    try {
      const storedExercise = await Exercise.upsert(flowId, exercise.spec)

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

      const nextQueue = [...exerciseQueue]
      const currentExercise = nextQueue[currentExerciseIndex]

      if (currentExercise) {
        nextQueue[currentExerciseIndex] = {
          ...currentExercise,
          id: storedExercise.id,
          exerciseKey: storedExercise.exerciseKey,
          stats: nextStats,
        }
      }

      console.log("[practice] rating persisted", {
        flowId: flowId,
        exerciseId: storedExercise.id,
        exerciseKey: storedExercise.exerciseKey,
        rating,
        totalAttempts: nextStats.totalAttempts,
        action: "advance_to_next_exercise",
      })

      advanceToNextExercise(nextQueue)
    } catch (error) {
      console.error("[practice] failed to persist rating", {
        flowId: flowId,
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
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 4,
          }}
        >
          {savedFlow ? (
            <TopBarButton
              label="Edit"
              icon="create-outline"
              onPress={() => {
                startEditingFlow(savedFlow)
                router.push("/choose-keys")
              }}
            />
          ) : (
            <View style={{ width: 72 }} />
          )}

          <View style={{ flex: 1 }}>
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
          </View>

          <Host matchContents>
            <Button
              label="Done"
              onPress={router.back}
              style={{ borderRadius: 16 }}
            />
          </Host>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: "row",
            gap: 10,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
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
                    alignItems: "stretch",
                    gap: 0,
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 72,
                        lineHeight: 78,
                        fontWeight: "700",
                        color: "#1f2835",
                        letterSpacing: -1.5,
                        textAlign: "center",
                      }}
                    >
                      {exercise.spec.key}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 1,
                      marginVertical: 24,
                      backgroundColor: "#E5E7EB",
                    }}
                  />

                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 28,
                        lineHeight: 34,
                        fontWeight: "600",
                        color: "#4b5563",
                        textAlign: "center",
                      }}
                    >
                      {getModeLabel(exercise.spec.mode)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 20,
                        lineHeight: 26,
                        color: "#6b7280",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      {`${octaveCount} octave${octaveCount === 1 ? "" : "s"}`}
                    </Text>
                  </View>

                  <View
                    style={{
                      width: 1,
                      marginVertical: 24,
                      backgroundColor: "#E5E7EB",
                    }}
                  />

                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 48,
                        lineHeight: 54,
                        fontWeight: "700",
                        color: "#1f2835",
                        textAlign: "center",
                      }}
                    >
                      {assignedTempo}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        lineHeight: 24,
                        fontWeight: "600",
                        color: "#6b7280",
                        textAlign: "center",
                        marginTop: 8,
                      }}
                    >
                      BPM
                    </Text>
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
            <SideToggleButton
              label="Metro"
              icon="timer-outline"
              active={isMetronomeRunning}
              onPress={handleMetronomeToggle}
            />
            <SideToggleButton
              label="Drone"
              icon="pulse-outline"
              active={isDroneRunning}
              onPress={handleDroneToggle}
            />
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
