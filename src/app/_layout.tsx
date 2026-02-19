import { useEffect } from "react"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter"

import { FlowStoreProvider } from "@/providers/FlowStoreProvider"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_600SemiBold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <FlowStoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FlowStoreProvider>
  )
}
