import { ReactNode } from "react"
import { Pressable, View, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface TopBarProps {
  title: string
  subtitle: string
  onBack: () => void
  onNext?: () => void
  nextDisabled?: boolean
  nextLabel?: ReactNode
}

export default function TopBar({
  title,
  subtitle,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel,
}: TopBarProps) {
  const isNextDisabled = !onNext || nextDisabled
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next"
        accessibilityState={{ disabled: isNextDisabled }}
        disabled={isNextDisabled}
        hitSlop={8}
        onPress={onNext}
        style={({ pressed }) => ({
          width: 34,
          height: 34,
          alignItems: "center",
          justifyContent: "center",
          opacity: !onNext ? 0 : nextDisabled ? 0.3 : pressed ? 0.6 : 1,
        })}
      >
        {nextLabel ?? <Ionicons name="arrow-forward" size={34} />}
      </Pressable>
    </View>
  )
}
