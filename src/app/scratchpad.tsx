import { useRouter } from "expo-router"
import { Button, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Scratchpad() {
  const router = useRouter()

  return (
    <SafeAreaView>
      <Button onPress={router.back} title="Home" />
      <Text>Hello</Text>
    </SafeAreaView>
  )
}
