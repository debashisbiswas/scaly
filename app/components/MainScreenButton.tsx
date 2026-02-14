import { Text, TouchableOpacity, StyleSheet } from "react-native"

interface MainScreenButtonProps {
  title: string
  onPress: () => void
}

export default function MainScreenButton({
  title,
  onPress,
}: MainScreenButtonProps) {
  return (
    <TouchableOpacity style={styles.mainButton} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  mainButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 18,
    boxShadow: "0px 8px 10.5px 0px #11182780",
    height: 74,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#111827",
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
})
