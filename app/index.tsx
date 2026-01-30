import { View } from "react-native";
import { BlackButton } from "./components/BlackButton";

export default function Index() {
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
          onPress={() => console.log("New Flow pressed")}
        />
        <BlackButton
          title="Flow Library"
          onPress={() => console.log("Flow Library pressed")}
        />
      </View>
    </View>
  );
}
