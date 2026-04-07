import { useLocalSearchParams, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import PracticeStaff from "@/components/PracticeStaff"
import {
  GeneratedExerciseSpec,
  expandFlowDraftToExerciseSpecs,
} from "@/core/flows"
import { listExercisesByFlowId } from "@/core/flows/sqliteExerciseRepository"
import { useFlowStore } from "@/providers/FlowStoreProvider"

type PracticeExercise = {
  id: string | null
  spec: GeneratedExerciseSpec
}

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

function DifficultyButtons({
  onRate,
  disabled,
}: {
  onRate: (rating: "again" | "hard" | "good" | "easy") => void
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
          disabled={disabled}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: button.color,
            opacity: disabled ? 0.5 : 1,
          }}
          onPress={() => onRate(button.rating)}
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

export default function Practice() {
  const [showNotes, setShowNotes] = useState(false)
  const [mainPanelWidth, setMainPanelWidth] = useState(0)
  const [mainPanelHeight, setMainPanelHeight] = useState(0)

  const { id } = useLocalSearchParams<{ id: string }>()
  const { getFlowById } = useFlowStore()
  const [exerciseQueue, setExerciseQueue] = useState<PracticeExercise[]>([])
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isLoadingExercise, setIsLoadingExercise] = useState(true)

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

      const storedExercises = await listExercisesByFlowId(id)

      if (storedExercises.length > 0) {
        console.log("[practice] loaded exercise from sqlite", {
          flowId: id,
          source: "sqlite",
          exerciseCount: storedExercises.length,
          firstExercise: storedExercises[0],
        })

        if (!cancelled) {
          setExerciseQueue(
            storedExercises.map((exercise) => ({
              id: exercise.id,
              spec: exercise.spec,
            })),
          )
          setCurrentExerciseIndex(0)
          setIsLoadingExercise(false)
        }
        return
      }

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
        const fallbackExercise = generated[0] ?? null

        console.log("[practice] loaded exercise from fallback flow config", {
          flowId: id,
          source: "flow-config-fallback",
          exerciseCount: generated.length,
          exerciseSpec: fallbackExercise,
        })

        if (!cancelled) {
          setExerciseQueue(
            generated.map((spec) => ({
              id: null,
              spec,
            })),
          )
          setCurrentExerciseIndex(0)
        }
      } catch {
        console.log("[practice] failed to derive exercise from flow config", {
          flowId: id,
          source: "flow-config-fallback",
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

  const sideRailWidth = 74
  const contentGap = 10
  const keyLabel = exercise.spec.key
  const modeLabel = getModeLabel(exercise.spec.mode)
  const octaveCount = exercise.spec.octaves

  const advanceToNextExercise = () => {
    if (exerciseQueue.length === 0) {
      return
    }

    setCurrentExerciseIndex((current) => (current + 1) % exerciseQueue.length)
  }

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    console.log("[practice] rating selected", {
      flowId: id,
      exerciseId: exercise.id,
      rating,
      action: "advance_to_next_exercise",
    })
    advanceToNextExercise()
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
        {`Exercise ${currentExerciseIndex + 1} of ${exerciseQueue.length}`}
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

        <DifficultyButtons onRate={handleRate} />
      </View>
    </SafeAreaView>
  )
}
