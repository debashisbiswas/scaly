import { View } from "react-native";
import { useRouter } from "expo-router";
import { BlackButton } from "./components/BlackButton";

export default function Index() {
  const router = useRouter();

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
          gap: 16,
          width: 200,
        }}
      >
        <BlackButton
          title="New Flow"
          onPress={() => router.push("/new-flow")}
        />
        <BlackButton
          title="Flow Library"
          onPress={() => console.log("Flow Library pressed")}
        />
      </View>
    </View>
  );
}
