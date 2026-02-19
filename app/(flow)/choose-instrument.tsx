import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { CLEF_OPTIONS, Clef } from "@/core/flows"

import SelectableButton from "../components/SelectableButton"
import TopBar from "../components/TopBar"
import { useFlowStore } from "../providers/FlowStoreProvider"

const CLEFS = CLEF_OPTIONS

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

  const allSelected = CLEFS.every((clef) => selectedClefs.has(clef))

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
              <SelectableButton
                key={clef}
                label={clef}
                selected={selectedClefs.has(clef)}
                onPress={() => toggleClef(clef)}
                style={styles.clefButton}
                labelStyle={styles.clefLabel}
              />
            ))}
          </View>
        </View>

        <SelectableButton
          label="Select All"
          selected={allSelected}
          onPress={() => {
            setSelectedClefs(allSelected ? new Set<Clef>() : new Set(CLEFS))
          }}
          style={styles.selectAllButton}
          labelStyle={styles.selectAllLabel}
        />
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
  selectAllButton: {
    marginBottom: 16,
    width: 150,
    height: 50,
    alignSelf: "center",
  },
  selectAllLabel: {
    fontSize: 16,
    textAlign: "center",
  },
})
