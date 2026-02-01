import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopBar } from "./components/TopBar";

export default function ChooseKey() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Range"
        subtitle="Use the two sliders to select your highest and lowest range"
        onBack={() => router.back()}
        onNext={() => router.push("/choose-mode")}
      />
    </SafeAreaView>
  );
}
