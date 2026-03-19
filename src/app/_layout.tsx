import { useEffect } from "react"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter"

import { useLogDbBootStatus } from "@/db/bootstrap"
import { useDbMigrations } from "@/db/migrate"
import { FlowStoreProvider } from "@/providers/FlowStoreProvider"

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_600SemiBold,
  })
  const { success, error } = useDbMigrations()
  useLogDbBootStatus({ success, error })

  useEffect(() => {
    const fontsReady = fontsLoaded || Boolean(fontError)
    const dbReady = success || Boolean(error)

    if (fontsReady && dbReady) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError, success, error])

  if (error) {
    throw error
  }

  if ((!fontsLoaded && !fontError) || !success) {
    return null
  }

  return (
    <FlowStoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </FlowStoreProvider>
  )
}
