import { StyleProp, StyleSheet, View, ViewStyle } from "react-native"

interface ProgressDotsProps {
  total: number
  activeIndex: number
  style?: StyleProp<ViewStyle>
}

export default function ProgressDots({
  total,
  activeIndex,
  style,
}: ProgressDotsProps) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeIndex ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    backgroundColor: "#9CA3B0",
  },
  inactiveDot: {
    backgroundColor: "#E5E7EB",
  },
})
