import {
  GeneratedExerciseSpec,
  getExerciseDefinitionByMode,
} from "@/core/flows"
import { ExercisePracticeStats } from "@/core/flows/exercisePracticeStats"
import { ExerciseQueue } from "@/core/flows/exerciseQueue"
import { Ionicons } from "@expo/vector-icons"
import { useState, useEffect } from "react"
import {
  useWindowDimensions,
  View,
  Pressable,
  ScrollView,
  Text,
} from "react-native"

function formatTempoBucket(tempo: GeneratedExerciseSpec["tempo"]) {
  if (tempo.kind === "single") {
    return `${tempo.bpm} BPM`
  }

  return `${tempo.minBpm}–${tempo.maxBpm} BPM`
}

// An absolutely-positioned sidebar to show details about the current exercise
// queue on the practice page.
export function DebugPracticeQueueSidebar(props: {
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
              const exerciseDefinition = getExerciseDefinitionByMode(
                queuedExercise.spec.mode,
              )
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
                    {exerciseDefinition.pickerLabel}
                  </Text>
                  <Text style={{ color: "#3c6fa7", fontSize: 12 }}>
                    Tempo bucket: {formatTempoBucket(queuedExercise.spec.tempo)}
                    , {octaveLabel}, start on {queuedExercise.spec.key}
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
