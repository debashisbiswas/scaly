import { View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface TopBarProps {
  title: string
  subtitle: string
  onBack: () => void
  onNext?: () => void
  nextLabel?: string | React.ReactElement
}

export default function TopBar({
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel,
}: TopBarProps) {
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 20,
      }}
    >
      <Text
        style={{ width: 34, height: 34, textAlign: "center" }}
        onPress={onBack}
      >
        <Ionicons name="arrow-back" size={34} />
      </Text>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter",
            fontWeight: "600",
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontSize: 16,
            opacity: 0.5,
            fontFamily: "Inter",
            fontWeight: "600",
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Text
        style={{
          width: 34,
          height: 34,
          textAlign: "center",
          opacity: onNext ? 1 : 0,
        }}
        onPress={onNext}
      >
        {nextLabel ? nextLabel : <Ionicons name="arrow-forward" size={34} />}
      </Text>
    </View>
  )
}
