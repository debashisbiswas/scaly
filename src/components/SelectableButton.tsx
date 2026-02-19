import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native"

interface SelectableButtonProps {
  label: string
  selected: boolean
  onPress: () => void
  style?: StyleProp<ViewStyle>
  labelStyle?: StyleProp<TextStyle>
}

export default function SelectableButton({
  label,
  selected,
  onPress,
  style,
  labelStyle,
}: SelectableButtonProps) {
  const buttonStateStyle = selected
    ? styles.selectedButton
    : styles.unselectedButton

  const labelStateStyle = selected
    ? styles.selectedLabel
    : styles.unselectedLabel

  return (
    <Pressable
      onPress={onPress}
      style={[styles.baseButton, style, buttonStateStyle]}
    >
      <Text style={[styles.baseText, labelStyle, labelStateStyle]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  baseButton: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  baseText: {
    fontWeight: "600",
    fontFamily: "Inter",
  },
  selectedButton: {
    backgroundColor: "#3B82F6",
  },
  unselectedButton: {
    backgroundColor: "#E5E7EB",
  },
  selectedLabel: {
    color: "#FFFFFF",
  },
  unselectedLabel: {
    color: "#6B7380",
  },
})
