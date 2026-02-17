import { useRouter } from "expo-router"
import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { CLEF_OPTIONS, Clef } from "@/core/flows"

import TopBar from "./components/TopBar"
import { useFlowStore } from "./providers/FlowStoreProvider"

const CLEFS = CLEF_OPTIONS

function ClefButton({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
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
  )
}

export default function ChooseInstrument() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedClefs, setSelectedClefs] = useState<Set<Clef>>(
    new Set(draft.clefs),
  )

  const toggleClef = (clef: Clef) => {
    setSelectedClefs((prev) => {
      const next = new Set(prev)
      if (next.has(clef)) {
        next.delete(clef)
      } else {
        next.add(clef)
      }
      return next
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Instrument"
        subtitle="Select what clef you want to play"
        onBack={() => router.back()}
        onNext={() => {
          updateDraft({ clefs: [...selectedClefs] })
          router.navigate("/choose-range")
        }}
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
            const allSelected = CLEFS.every((clef) => selectedClefs.has(clef))
            setSelectedClefs(allSelected ? new Set<Clef>() : new Set(CLEFS))
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
  )
}
