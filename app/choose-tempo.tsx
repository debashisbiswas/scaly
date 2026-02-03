import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import TopBar from "./components/TopBar";

export default function ChooseTempo() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your tempo"
        subtitle="Use the slider or input your desired tempo"
        onBack={() => router.back()}
        onNext={() => router.push("/choose-rhythm-and-articulation")}
      />
    </SafeAreaView>
  );
}
