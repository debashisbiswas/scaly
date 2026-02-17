import { View, ImageBackground } from "react-native"
import { useRouter } from "expo-router"
import MainScreenButton from "./components/MainScreenButton"
import { useFlowStore } from "./providers/FlowStoreProvider"

export default function Index() {
  const router = useRouter()
  const { resetDraft } = useFlowStore()

  return (
    <ImageBackground
      source={require("../assets/images/mainsplash.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <View
        style={{
          gap: 40,
          width: 232,
        }}
      >
        <MainScreenButton
          title="Create Flow"
          onPress={() => {
            resetDraft()
            router.push("/choose-keys")
          }}
        />
        <MainScreenButton
          title="Flow Library"
          onPress={() => router.push("/flow-library")}
        />
      </View>
    </ImageBackground>
  )
}
