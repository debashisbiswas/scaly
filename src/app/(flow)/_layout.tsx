import { Stack, usePathname } from "expo-router"
import { StyleSheet, View } from "react-native"

import ProgressDots from "@/components/ProgressDots"
import { FLOW_PROGRESS_TOTAL, getFlowProgressIndex } from "@/flowProgress"

export default function FlowLayout() {
  const pathname = usePathname()
  const activeIndex = getFlowProgressIndex(pathname)

  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      {typeof activeIndex === "number" ? (
        <View style={styles.progressDotsAnchor} pointerEvents="none">
          <ProgressDots total={FLOW_PROGRESS_TOTAL} activeIndex={activeIndex} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  progressDotsAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})
