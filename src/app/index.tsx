import { View, ImageBackground, Text, TouchableOpacity } from "react-native"
import { useRouter } from "expo-router"
import MainScreenButton from "@/components/MainScreenButton"
import { useFlowStore } from "@/providers/FlowStoreProvider"

export default function Index() {
  const router = useRouter()
  const { resetDraft } = useFlowStore()

  return (
    <ImageBackground
      source={require("../../assets/images/mainsplash.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <TouchableOpacity
        onPress={() => router.push("/debug-range" as never)}
        style={{
          position: "absolute",
          top: 56,
          left: 18,
          backgroundColor: "#2563EB",
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#1D4ED8",
        }}
      >
        <Text
          style={{
            color: "#F8FAFC",
            fontSize: 11,
            fontFamily: "Inter_600SemiBold",
            textAlign: "center",
          }}
        >
          Demos
        </Text>
      </TouchableOpacity>

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
