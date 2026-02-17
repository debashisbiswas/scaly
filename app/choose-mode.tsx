import { useRouter } from "expo-router"
import { useState } from "react"
import { View, Text, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { MODE_OPTIONS, ScaleMode } from "@/core/flows"

import TopBar from "./components/TopBar"
import { useFlowStore } from "./providers/FlowStoreProvider"

const MODES = MODE_OPTIONS

function ModeButton({
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
        minWidth: 150,
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

export default function ChooseMode() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedModes, setSelectedModes] = useState<Set<ScaleMode>>(
    new Set(draft.modes),
  )

  const toggleMode = (mode: ScaleMode) => {
    setSelectedModes((prev) => {
      const next = new Set(prev)
      if (next.has(mode)) {
        next.delete(mode)
      } else {
        next.add(mode)
      }
      return next
    })
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your mode"
        subtitle="Select all that apply"
        onBack={() => router.back()}
        onNext={() => {
          updateDraft({ modes: [...selectedModes] })
          router.push("/choose-tempo")
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
            {MODES.map((mode) => (
              <ModeButton
                key={mode}
                label={mode}
                selected={selectedModes.has(mode)}
                onPress={() => toggleMode(mode)}
              />
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => {
            const allSelected = MODES.every((mode) => selectedModes.has(mode))
            setSelectedModes(
              allSelected ? new Set<ScaleMode>() : new Set(MODES),
            )
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
