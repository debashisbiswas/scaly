import Slider from "@react-native-community/slider"
import { Text, View } from "react-native"

interface VerticalNoteSliderProps {
  value: number
  min: number
  max: number
  onValueChange: (value: number) => void
  topLabel: string
  bottomLabel: string
}

export default function VerticalNoteSlider({
  value,
  min,
  max,
  onValueChange,
  topLabel,
  bottomLabel,
}: VerticalNoteSliderProps) {
  return (
    <View style={{ width: 54, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 12, opacity: 0.6 }}>{topLabel}</Text>

      <View
        style={{
          height: 240,
          width: 40,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Slider
          style={{
            width: 220,
            height: 40,
            transform: [{ rotate: "-90deg" }],
          }}
          minimumValue={min}
          maximumValue={max}
          value={value}
          step={1}
          onValueChange={onValueChange}
          minimumTrackTintColor="#101010"
          maximumTrackTintColor="#bdbdbd"
          thumbTintColor="#101010"
        />
      </View>

      <Text style={{ fontSize: 12, opacity: 0.6 }}>{bottomLabel}</Text>
    </View>
  )
}
