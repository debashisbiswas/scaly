import { Text, TouchableOpacity, StyleSheet } from "react-native";

interface BlackButtonProps {
  title: string;
  onPress: () => void;
}

export default function BlackButton({ title, onPress }: BlackButtonProps) {
  return (
    <TouchableOpacity style={styles.blackButton} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blackButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
