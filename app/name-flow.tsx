import { useRouter } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"

import TopBar from "./components/TopBar"

export default function ChooseTempo() {
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Name this Flow"
        subtitle="This can be changed later"
        onBack={() => router.back()}
      />
    </SafeAreaView>
  )
}
