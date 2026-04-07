import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Pressable,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native"
import { Slider } from "@miblanchard/react-native-slider"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  DEFAULT_SINGLE_BPM,
  MAX_BPM,
  MIN_BPM,
  TempoSetting,
} from "@/core/flows"

import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const TEMPO_BANDS = [
  { name: "Largo", min: 40, max: 60 },
  { name: "Andante", min: 76, max: 108 },
  { name: "Allegro", min: 120, max: 168 },
  { name: "Presto", min: 168, max: 200 },
] as const

const THUMB_SIZE = 24
const RANGE_VALUE_INDICATOR_WIDTH = 80

type TempoMode = "single" | "range"
type EditingField = "single" | "range-low" | "range-high" | null

function clampBpm(value: number) {
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
}

function asArray(value: number[] | number) {
  return Array.isArray(value) ? value : [value]
}

function sanitizeTempoInput(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 3)
}

function parseTempoInput(value: string) {
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? clampBpm(parsed) : null
}

function getCommittedSingleBpm(inputValue: string, fallback: number) {
  return parseTempoInput(inputValue) ?? fallback
}

function getCommittedRangeLowBpm(
  inputValue: string,
  currentRange: [number, number],
) {
  const parsed = parseTempoInput(inputValue)
  const nextLow = parsed ?? currentRange[0]

  return Math.min(nextLow, currentRange[1])
}

function getCommittedRangeHighBpm(
  inputValue: string,
  currentRange: [number, number],
) {
  const parsed = parseTempoInput(inputValue)
  const nextHigh = parsed ?? currentRange[1]

  return Math.max(nextHigh, currentRange[0])
}

type EditableTempoValueProps = {
  value: number
  inputValue: string
  editing: boolean
  onPress: () => void
  onChangeText: (value: string) => void
  onCommit: () => void
  onWidthChange?: (width: number) => void
  backgroundColor: string
  textColor: string
  minWidth?: number
  width?: number
}

function EditableTempoValue({
  value,
  inputValue,
  editing,
  onPress,
  onChangeText,
  onCommit,
  onWidthChange,
  backgroundColor,
  textColor,
  minWidth = 64,
  width,
}: EditableTempoValueProps) {
  const bubbleStyle = {
    minWidth,
    width,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }

  const textStyle = {
    fontSize: 32,
    fontWeight: "600" as const,
    fontFamily: "Inter",
    color: textColor,
  }

  return (
    <View
      onLayout={({ nativeEvent }) => {
        if (!onWidthChange) {
          return
        }

        const nextWidth = Math.round(nativeEvent.layout.width)
        onWidthChange(nextWidth)
      }}
    >
      {editing ? (
        <TextInput
          value={inputValue}
          onChangeText={(nextValue) =>
            onChangeText(sanitizeTempoInput(nextValue))
          }
          onBlur={onCommit}
          onSubmitEditing={onCommit}
          autoFocus
          selectTextOnFocus
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={3}
          style={{
            ...bubbleStyle,
            ...textStyle,
            textAlign: "center",
          }}
        />
      ) : (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={({ pressed }) => ({
            ...bubbleStyle,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={textStyle}>{value}</Text>
        </Pressable>
      )}
    </View>
  )
}

export default function ChooseTempo() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const { width: screenWidth } = useWindowDimensions()
  const sliderWidth = Math.max(260, Math.min(screenWidth - 40, 620))
  const [mode, setMode] = useState<TempoMode>(
    draft.tempo.kind === "range" ? "range" : "single",
  )
  const [singleBpm, setSingleBpm] = useState(
    draft.tempo.kind === "single" ? draft.tempo.bpm : DEFAULT_SINGLE_BPM,
  )
  const [rangeBpm, setRangeBpm] = useState<[number, number]>(
    draft.tempo.kind === "range"
      ? [draft.tempo.minBpm, draft.tempo.maxBpm]
      : [88, 124],
  )
  const [singleInput, setSingleInput] = useState(String(singleBpm))
  const [rangeLowInput, setRangeLowInput] = useState(String(rangeBpm[0]))
  const [rangeHighInput, setRangeHighInput] = useState(String(rangeBpm[1]))
  const [editingField, setEditingField] = useState<EditingField>(null)
  const [singleNumberWidth, setSingleNumberWidth] = useState(64)
  const [rangeRightNumberWidth, setRangeRightNumberWidth] = useState(64)

  useEffect(() => {
    if (editingField !== "single") {
      setSingleInput(String(singleBpm))
    }
  }, [editingField, singleBpm])

  useEffect(() => {
    if (editingField !== "range-low") {
      setRangeLowInput(String(rangeBpm[0]))
    }
  }, [editingField, rangeBpm])

  useEffect(() => {
    if (editingField !== "range-high") {
      setRangeHighInput(String(rangeBpm[1]))
    }
  }, [editingField, rangeBpm])

  const getThumbCenter = (value: number) => {
    const ratio = (clampBpm(value) - MIN_BPM) / (MAX_BPM - MIN_BPM)
    return THUMB_SIZE / 2 + ratio * (sliderWidth - THUMB_SIZE)
  }

  const commitSingleInput = () => {
    const nextBpm = getCommittedSingleBpm(singleInput, singleBpm)
    setSingleBpm(nextBpm)
    setSingleInput(String(nextBpm))
    setEditingField((current) => (current === "single" ? null : current))
  }

  const commitRangeLowInput = () => {
    const nextLow = getCommittedRangeLowBpm(rangeLowInput, rangeBpm)
    setRangeBpm([nextLow, rangeBpm[1]])
    setRangeLowInput(String(nextLow))
    setEditingField((current) => (current === "range-low" ? null : current))
  }

  const commitRangeHighInput = () => {
    const nextHigh = getCommittedRangeHighBpm(rangeHighInput, rangeBpm)
    setRangeBpm([rangeBpm[0], nextHigh])
    setRangeHighInput(String(nextHigh))
    setEditingField((current) => (current === "range-high" ? null : current))
  }

  const commitEditingField = (field: EditingField) => {
    if (field === "single") {
      commitSingleInput()
      return
    }

    if (field === "range-low") {
      commitRangeLowInput()
      return
    }

    if (field === "range-high") {
      commitRangeHighInput()
    }
  }

  const startEditingField = (field: Exclude<EditingField, null>) => {
    if (editingField && editingField !== field) {
      commitEditingField(editingField)
    }

    if (field === "single") {
      setSingleInput(String(singleBpm))
    }

    if (field === "range-low") {
      setRangeLowInput(String(rangeBpm[0]))
    }

    if (field === "range-high") {
      setRangeHighInput(String(rangeBpm[1]))
    }

    setEditingField(field)
  }

  const handleModeChange = (nextMode: TempoMode) => {
    if (nextMode === mode) {
      return
    }

    const committedSingleBpm =
      editingField === "single"
        ? getCommittedSingleBpm(singleInput, singleBpm)
        : singleBpm
    const committedRangeBpm: [number, number] = [
      editingField === "range-low"
        ? getCommittedRangeLowBpm(rangeLowInput, rangeBpm)
        : rangeBpm[0],
      editingField === "range-high"
        ? getCommittedRangeHighBpm(rangeHighInput, rangeBpm)
        : rangeBpm[1],
    ]

    if (nextMode === "range") {
      const nextLow = clampBpm(committedSingleBpm - 10)
      const nextHigh = clampBpm(committedSingleBpm + 10)
      const nextRange: [number, number] = [
        Math.min(nextLow, nextHigh),
        Math.max(nextLow, nextHigh),
      ]
      setRangeBpm(nextRange)
      setRangeLowInput(String(nextRange[0]))
      setRangeHighInput(String(nextRange[1]))
    } else {
      const nextSingle = clampBpm(
        (committedRangeBpm[0] + committedRangeBpm[1]) / 2,
      )
      setSingleBpm(nextSingle)
      setSingleInput(String(nextSingle))
    }

    setEditingField(null)
    setMode(nextMode)
  }

  const handleTempoChange = (value: number[] | number) => {
    const values = asArray(value)

    if (mode === "single") {
      const nextBpm = clampBpm(values[0] ?? singleBpm)
      setSingleBpm(nextBpm)
      return
    }

    const start = clampBpm(values[0] ?? rangeBpm[0])
    const end = clampBpm(values[1] ?? start)
    setRangeBpm([Math.min(start, end), Math.max(start, end)])
  }

  const handleNext = () => {
    const nextSingleBpm =
      editingField === "single"
        ? getCommittedSingleBpm(singleInput, singleBpm)
        : singleBpm
    const nextRangeBpm: [number, number] = [
      editingField === "range-low"
        ? getCommittedRangeLowBpm(rangeLowInput, rangeBpm)
        : rangeBpm[0],
      editingField === "range-high"
        ? getCommittedRangeHighBpm(rangeHighInput, rangeBpm)
        : rangeBpm[1],
    ]

    const tempo: TempoSetting =
      mode === "single"
        ? { kind: "single", bpm: nextSingleBpm }
        : { kind: "range", minBpm: nextRangeBpm[0], maxBpm: nextRangeBpm[1] }

    updateDraft({ tempo })
    router.push("/name-flow")
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your tempo"
        subtitle="Use the slider or input your desired tempo"
        onBack={() => router.back()}
        onNext={handleNext}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingTop: 28,
          paddingBottom: 10,
          paddingHorizontal: 12,
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 999,
            overflow: "hidden",
            width: 220,
          }}
        >
          <Pressable
            onPress={() => handleModeChange("single")}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
              backgroundColor: mode === "single" ? "#000" : "#fff",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: mode === "single" ? "#fff" : "#000",
              }}
            >
              Single
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleModeChange("range")}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 10,
              backgroundColor: mode === "range" ? "#000" : "#fff",
            }}
          >
            <Text
              style={{
                fontWeight: "600",
                color: mode === "range" ? "#fff" : "#000",
              }}
            >
              Range
            </Text>
          </Pressable>
        </View>

        <View style={{ width: "100%", alignItems: "center", gap: 22 }}>
          <View style={{ width: sliderWidth, paddingTop: 52 }}>
            {mode === "single" ? (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: getThumbCenter(singleBpm) - singleNumberWidth / 2,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <EditableTempoValue
                    value={singleBpm}
                    inputValue={singleInput}
                    editing={editingField === "single"}
                    onPress={() => startEditingField("single")}
                    onChangeText={setSingleInput}
                    onCommit={commitSingleInput}
                    onWidthChange={(nextWidth) => {
                      if (nextWidth !== singleNumberWidth) {
                        setSingleNumberWidth(nextWidth)
                      }
                    }}
                    backgroundColor="#3B82F6"
                    textColor="#FFFFFF"
                  />
                  <Text
                    style={{
                      color: "#555555",
                      fontSize: 20,
                      marginLeft: 6,
                      fontFamily: "Inter",
                      fontWeight: "600",
                    }}
                  >
                    BPM
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View
                  style={{
                    position: "absolute",
                    left:
                      getThumbCenter(rangeBpm[0]) -
                      RANGE_VALUE_INDICATOR_WIDTH / 2,
                    width: RANGE_VALUE_INDICATOR_WIDTH,
                    alignItems: "center",
                  }}
                >
                  <EditableTempoValue
                    value={rangeBpm[0]}
                    inputValue={rangeLowInput}
                    editing={editingField === "range-low"}
                    onPress={() => startEditingField("range-low")}
                    onChangeText={setRangeLowInput}
                    onCommit={commitRangeLowInput}
                    backgroundColor="#3B82F6"
                    textColor="#FFFFFF"
                    width={RANGE_VALUE_INDICATOR_WIDTH}
                    minWidth={RANGE_VALUE_INDICATOR_WIDTH}
                  />
                </View>
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left:
                      getThumbCenter(rangeBpm[1]) - rangeRightNumberWidth / 2,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <EditableTempoValue
                      value={rangeBpm[1]}
                      inputValue={rangeHighInput}
                      editing={editingField === "range-high"}
                      onPress={() => startEditingField("range-high")}
                      onChangeText={setRangeHighInput}
                      onCommit={commitRangeHighInput}
                      onWidthChange={(nextWidth) => {
                        if (nextWidth !== rangeRightNumberWidth) {
                          setRangeRightNumberWidth(nextWidth)
                        }
                      }}
                      backgroundColor="#3B82F6"
                      textColor="#FFFFFF"
                    />
                    <Text
                      style={{
                        color: "#555555",
                        fontSize: 20,
                        marginLeft: 6,
                        fontFamily: "Inter",
                        fontWeight: "600",
                      }}
                    >
                      BPM
                    </Text>
                  </View>
                </View>
              </>
            )}

            <View style={{ marginTop: 6 }}>
              <Slider
                value={
                  mode === "single" ? [singleBpm] : [rangeBpm[0], rangeBpm[1]]
                }
                minimumValue={MIN_BPM}
                maximumValue={MAX_BPM}
                step={1}
                onValueChange={handleTempoChange}
                minimumTrackTintColor="#101010"
                maximumTrackTintColor="#c5c5c5"
                trackStyle={{ height: 8, borderRadius: 999 }}
                thumbStyle={{
                  height: THUMB_SIZE,
                  width: THUMB_SIZE,
                  borderRadius: 12,
                  backgroundColor: "#101010",
                }}
                containerStyle={{ height: 44 }}
              />
            </View>
          </View>

          <View
            style={{
              width: sliderWidth,
              minHeight: 60,
              flexDirection: "row",
            }}
          >
            {TEMPO_BANDS.map((band) => (
              <View key={band.name} style={{ flex: 1, alignItems: "center" }}>
                <Text style={{ fontWeight: "600" }}>{band.name}</Text>
                <Text style={{ fontSize: 12, opacity: 0.65 }}>
                  {band.min}-{band.max} BPM
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}
