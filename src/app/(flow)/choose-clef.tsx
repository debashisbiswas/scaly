import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import type { Clef } from "@/core/flows"
import { CLEF_GLYPHS } from "@/core/music/clefGlyphs"

import SelectableButton from "@/components/SelectableButton"
import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

export default function ChooseClef() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedClef, setSelectedClef] = useState<Clef | null>(draft.clef)

  const toggleClef = (clef: Clef) => {
    setSelectedClef((current) => (current === clef ? null : clef))
  }

  const clefOptions: { label: string; value: Clef }[] = [
    {
      label: CLEF_GLYPHS["Treble Clef"],
      value: "Treble Clef",
    },
    {
      label: CLEF_GLYPHS["Bass Clef"],
      value: "Bass Clef",
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Clef"
        subtitle="Select which clef you want to play"
        onBack={() => router.back()}
        onNext={() => {
          if (selectedClef === null) {
            return
          }

          updateDraft({ clef: selectedClef })
          router.navigate("/choose-range")
        }}
        nextDisabled={selectedClef === null}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {clefOptions.map((clef) => (
              <SelectableButton
                key={clef.value}
                label={clef.label}
                selected={selectedClef === clef.value}
                onPress={() => toggleClef(clef.value)}
                style={styles.clefButton}
                labelStyle={styles.clefLabel}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  clefButton: {
    width: 110,
    height: 100,
  },
  clefLabel: {
    fontSize: 48,
    fontFamily: "BravuraText",
  },
})
