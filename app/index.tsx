import { View } from "react-native"
import { useRouter } from "expo-router"
import MainScreenButton from "./components/MainScreenButton"

export default function Index() {
  const router = useRouter()

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          gap: 40,
          width: 232,
        }}
      >
        <MainScreenButton
          title="Create Flow"
          onPress={() => router.push("/choose-keys")}
        />
        <MainScreenButton
          title="Flow Library"
          onPress={() => router.push("/flow-library")}
        />
      </View>
    </View>
  )
}
