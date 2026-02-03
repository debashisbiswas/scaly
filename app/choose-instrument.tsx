import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TopBar from "./components/TopBar";

const CLEFS = ["Bass Clef", "Treble Clef"];

function ClefButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: "#000",
        borderRadius: 8,
        backgroundColor: selected ? "#000" : "#fff",
        minWidth: 130,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          color: selected ? "#fff" : "#000",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ChooseInstrument() {
  const router = useRouter();
  const [selectedClefs, setSelectedClefs] = useState<Set<string>>(new Set());

  const toggleClef = (clef: string) => {
    setSelectedClefs((prev) => {
      const next = new Set(prev);
      if (next.has(clef)) {
        next.delete(clef);
      } else {
        next.add(clef);
      }
      return next;
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Instrument"
        subtitle="Select what clef you want to play"
        onBack={() => router.back()}
        onNext={() => router.navigate("/choose-range")}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {CLEFS.map((clef) => (
              <ClefButton
                key={clef}
                label={clef}
                selected={selectedClefs.has(clef)}
                onPress={() => toggleClef(clef)}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => {
            const allSelected = CLEFS.every((clef) => selectedClefs.has(clef));
            setSelectedClefs(allSelected ? new Set() : new Set(CLEFS));
          }}
          style={{
            marginBottom: 16,
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderWidth: 1,
            borderColor: "#000",
            borderRadius: 8,
            alignSelf: "center",
          }}
        >
          <Text style={{ fontWeight: "600" }}>Select All</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
