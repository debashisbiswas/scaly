import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { CLEF_OPTIONS, Clef } from "@/core/flows"

import SelectableButton from "@/components/SelectableButton"
import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const CLEFS = CLEF_OPTIONS

export default function ChooseClef() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedClef, setSelectedClef] = useState<Clef | null>(draft.clef)

  const toggleClef = (clef: Clef) => {
    setSelectedClef((current) => (current === clef ? null : clef))
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Clef"
        subtitle="Select which clef you want to play"
        onBack={() => router.back()}
        onNext={() => {
          updateDraft({ clef: selectedClef })
          router.navigate("/choose-range")
        }}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", gap: 12 }}>
            {CLEFS.map((clef) => (
              <SelectableButton
                key={clef}
                label={clef}
                selected={selectedClef === clef}
                onPress={() => toggleClef(clef)}
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
    width: 130,
    height: 56,
  },
  clefLabel: {
    fontSize: 16,
  },
})
