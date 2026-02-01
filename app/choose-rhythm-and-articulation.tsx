import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { TopBar } from "./components/TopBar";

export default function ChooseTempo() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Rhythm and Articulation"
        subtitle="Select all that apply"
        onBack={() => router.back()}
      />
    </SafeAreaView>
  );
}
