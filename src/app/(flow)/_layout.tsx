import { Stack, usePathname } from "expo-router"
import { StyleSheet, View } from "react-native"

import ProgressDots from "@/components/ProgressDots"
import { fullScreenGestureEnabled } from "@/config"

const FLOW_ROUTES = [
  "/choose-keys",
  "/choose-clef",
  "/choose-range",
  "/choose-mode",
  "/choose-tempo",
  "/name-flow",
] as const

export default function FlowLayout() {
  const pathname = usePathname()
  const activeIndex = FLOW_ROUTES.findIndex((route) => route === pathname)

  // TODO: We can disable fullScreenGestureEnabled here, but how do we just
  // disable it for a single screen?
  // Or maybe disabling it for all screens is fine for now?
  return (
    <View style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#ffffff" },
          fullScreenGestureEnabled,
        }}
      />
      {typeof activeIndex === "number" ? (
        <View style={styles.progressDotsAnchor} pointerEvents="none">
          <ProgressDots total={FLOW_ROUTES.length} activeIndex={activeIndex} />
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
