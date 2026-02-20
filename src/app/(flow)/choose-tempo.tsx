import { useRouter } from "expo-router"
import { useState } from "react"
import { Pressable, Text, View, useWindowDimensions } from "react-native"
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

function clampBpm(value: number) {
  return Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(value)))
}

function asArray(value: number[] | number) {
  return Array.isArray(value) ? value : [value]
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
  const [singleNumberWidth, setSingleNumberWidth] = useState(64)
  const [rangeRightNumberWidth, setRangeRightNumberWidth] = useState(64)

  const getThumbCenter = (value: number) => {
    const ratio = (clampBpm(value) - MIN_BPM) / (MAX_BPM - MIN_BPM)
    return THUMB_SIZE / 2 + ratio * (sliderWidth - THUMB_SIZE)
  }

  const handleModeChange = (nextMode: TempoMode) => {
    if (nextMode === mode) {
      return
    }

    if (nextMode === "range") {
      const nextLow = clampBpm(singleBpm - 10)
      const nextHigh = clampBpm(singleBpm + 10)
      setRangeBpm([Math.min(nextLow, nextHigh), Math.max(nextLow, nextHigh)])
    } else {
      setSingleBpm(clampBpm((rangeBpm[0] + rangeBpm[1]) / 2))
    }

    setMode(nextMode)
  }

  const handleTempoChange = (value: number[] | number) => {
    const values = asArray(value)

    if (mode === "single") {
      setSingleBpm(clampBpm(values[0] ?? singleBpm))
      return
    }

    const start = clampBpm(values[0] ?? rangeBpm[0])
    const end = clampBpm(values[1] ?? start)
    setRangeBpm([Math.min(start, end), Math.max(start, end)])
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your tempo"
        subtitle="Use the slider or input your desired tempo"
        onBack={() => router.back()}
        onNext={() => {
          const tempo: TempoSetting =
            mode === "single"
              ? { kind: "single", bpm: singleBpm }
              : { kind: "range", minBpm: rangeBpm[0], maxBpm: rangeBpm[1] }

          updateDraft({ tempo })
          router.push("/choose-rhythm-and-articulation")
        }}
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
                  <Text
                    onLayout={({ nativeEvent }) => {
                      const nextWidth = Math.round(nativeEvent.layout.width)
                      if (nextWidth !== singleNumberWidth) {
                        setSingleNumberWidth(nextWidth)
                      }
                    }}
                    style={{
                      fontSize: 32,
                      fontWeight: "600",
                      fontFamily: "Inter",
                      backgroundColor: "#CBCBCB",
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    {singleBpm}
                  </Text>
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
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "600",
                      fontFamily: "Inter",
                      backgroundColor: "#CBCBCB",
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 12,
                    }}
                  >
                    {rangeBpm[0]}
                  </Text>
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
                    <Text
                      onLayout={({ nativeEvent }) => {
                        const nextWidth = Math.round(nativeEvent.layout.width)
                        if (nextWidth !== rangeRightNumberWidth) {
                          setRangeRightNumberWidth(nextWidth)
                        }
                      }}
                      style={{
                        fontSize: 32,
                        fontWeight: "600",
                        fontFamily: "Inter",
                        backgroundColor: "#CBCBCB",
                        paddingHorizontal: 8,
                        paddingVertical: 5,
                        borderRadius: 12,
                      }}
                    >
                      {rangeBpm[1]}
                    </Text>
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
