import { View, Text } from "react-native"

interface TopBarProps {
  title: string
  subtitle: string
  onBack: () => void
  onNext?: () => void
  nextLabel?: string
}

export default function TopBar({
  title,
  subtitle,
  onBack,
  onNext,
  nextLabel = ">",
}: TopBarProps) {
  return (
    <View
      style={{
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingTop: 14,
      }}
    >
      <Text style={{ padding: 8, borderWidth: 1 }} onPress={onBack}>
        {"<"}
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
            fontWeight: "semibold",
            fontSize: 20,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontWeight: "semibold",
            opacity: 0.5,
          }}
        >
          {subtitle}
        </Text>
      </View>
      <Text
        style={{
          padding: 8,
          borderWidth: 1,
          opacity: onNext ? 1 : 0,
        }}
        onPress={onNext}
      >
        {nextLabel}
      </Text>
    </View>
  )
}
