import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import {
  FLAT_KEY_SIGNATURE_OPTIONS,
  KeySignature,
  SHARP_KEY_SIGNATURE_OPTIONS,
} from "@/core/flows"
import SelectableButton from "@/components/SelectableButton"
import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const SHARP_KEYS = SHARP_KEY_SIGNATURE_OPTIONS
const FLAT_KEYS = FLAT_KEY_SIGNATURE_OPTIONS
const ALL_KEYS: KeySignature[] = ["C", ...SHARP_KEYS, "F#/Gb", ...FLAT_KEYS]

export default function ChooseKey() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedNotes, setSelectedNotes] = useState<Set<KeySignature>>(
    new Set(draft.keys),
  )

  const toggleNote = (note: KeySignature) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev)
      if (next.has(note)) {
        next.delete(note)
      } else {
        next.add(note)
      }
      return next
    })
  }

  const allSelected = ALL_KEYS.every((note) => selectedNotes.has(note))

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <TopBar
        title="Choose your keys"
        subtitle="Select all that apply"
        onBack={() => router.back()}
        onNext={() => {
          updateDraft({ keys: [...selectedNotes] })
          router.navigate("/choose-clef")
        }}
      />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 24,
        }}
      >
        {/* Parent row */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
          <SelectableButton
            label="C"
            selected={selectedNotes.has("C")}
            onPress={() => toggleNote("C")}
            style={styles.noteButton}
          />

          <View style={{ gap: 14 }}>
            {/* Top row */}
            <View style={{ flexDirection: "row", gap: 24 }}>
              {SHARP_KEYS.map((note) => (
                <SelectableButton
                  key={note}
                  label={note}
                  selected={selectedNotes.has(note)}
                  onPress={() => toggleNote(note)}
                  style={styles.noteButton}
                />
              ))}
            </View>

            {/* Bottom row */}
            <View style={{ flexDirection: "row", gap: 24 }}>
              {FLAT_KEYS.map((note) => (
                <SelectableButton
                  key={note}
                  label={note}
                  selected={selectedNotes.has(note)}
                  onPress={() => toggleNote(note)}
                  style={styles.noteButton}
                />
              ))}
            </View>
          </View>

          <SelectableButton
            label="F#/Gb"
            selected={selectedNotes.has("F#/Gb")}
            onPress={() => toggleNote("F#/Gb")}
            style={styles.noteButton}
          />
        </View>

        <SelectableButton
          label="Select All"
          selected={allSelected}
          onPress={() => {
            setSelectedNotes(
              allSelected ? new Set<KeySignature>() : new Set(ALL_KEYS),
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
  noteButton: {
    width: 60,
    height: 50,
  },
  selectAllButton: {
    marginTop: 26,
    width: 150,
    height: 50,
    alignSelf: "center",
  },
  selectAllLabel: {
    fontSize: 16,
    textAlign: "center",
  },
})
