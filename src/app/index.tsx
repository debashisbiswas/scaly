import { View, ImageBackground } from "react-native"
import { useRouter } from "expo-router"
import MainScreenButton from "@/components/MainScreenButton"
import { useFlowStore } from "@/providers/FlowStoreProvider"

import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import * as SQLite from "expo-sqlite"

const DEBUG = false
const db = SQLite.openDatabaseSync("scaly.db")

export default function Index() {
  const router = useRouter()
  const { resetDraft } = useFlowStore()
  useDrizzleStudio(db)

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
        {DEBUG && (
          <MainScreenButton
            title="dev"
            onPress={() => router.push("/scratchpad")}
          />
        )}
      </View>
    </ImageBackground>
  )
}
