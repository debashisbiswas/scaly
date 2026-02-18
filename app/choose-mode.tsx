import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { MODE_OPTIONS, ScaleMode } from "@/core/flows"

import SelectableButton from "./components/SelectableButton"
import TopBar from "./components/TopBar"
import { useFlowStore } from "./providers/FlowStoreProvider"

const MODES = MODE_OPTIONS

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

  const allSelected = MODES.every((mode) => selectedModes.has(mode))

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
          <View style={styles.modesWrap}>
            {MODES.map((mode) => (
              <SelectableButton
                key={mode}
                label={mode}
                selected={selectedModes.has(mode)}
                onPress={() => toggleMode(mode)}
                style={styles.modeButton}
                labelStyle={styles.modeLabel}
              />
            ))}
          </View>
        </View>

        <SelectableButton
          label="Select All"
          selected={allSelected}
          onPress={() => {
            setSelectedModes(
              allSelected ? new Set<ScaleMode>() : new Set(MODES),
            )
          }}
          style={styles.selectAllButton}
          labelStyle={styles.selectAllLabel}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  modesWrap: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  modeButton: {
    width: 150,
    height: 56,
  },
  modeLabel: {
    fontSize: 16,
    textAlign: "center",
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
