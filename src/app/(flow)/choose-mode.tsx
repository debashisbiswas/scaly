import { useRouter } from "expo-router"
import { useState } from "react"
import { StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { EXERCISE_CATALOG, ExerciseSelection, MODE_OPTIONS } from "@/core/flows"

import SelectableButton from "@/components/SelectableButton"
import TopBar from "@/components/TopBar"
import { useFlowStore } from "@/providers/FlowStoreProvider"

const EXERCISES = EXERCISE_CATALOG

export default function ChooseMode() {
  const router = useRouter()
  const { draft, updateDraft } = useFlowStore()
  const [selectedExercises, setSelectedExercises] = useState<
    Set<ExerciseSelection>
  >(new Set(draft.modes))

  const toggleExercise = (exercise: ExerciseSelection) => {
    setSelectedExercises((prev) => {
      const next = new Set(prev)
      if (next.has(exercise)) {
        next.delete(exercise)
      } else {
        next.add(exercise)
      }
      return next
    })
  }

  const allSelected = MODE_OPTIONS.every((exercise) =>
    selectedExercises.has(exercise),
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TopBar
        title="Choose your exercises"
        subtitle="Select all that apply"
        onBack={() => router.back()}
        onNext={() => {
          if (selectedExercises.size === 0) {
            return
          }

          updateDraft({ modes: [...selectedExercises] })
          router.push("/choose-tempo")
        }}
        nextDisabled={selectedExercises.size === 0}
      />

      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.exercisesWrap}>
            {EXERCISES.map((exercise) => (
              <SelectableButton
                key={exercise.selection}
                label={exercise.pickerLabel}
                selected={selectedExercises.has(exercise.selection)}
                onPress={() => toggleExercise(exercise.selection)}
                style={styles.exerciseButton}
                labelStyle={styles.exerciseLabel}
              />
            ))}
          </View>
        </View>

        <SelectableButton
          label="Select All"
          selected={allSelected}
          onPress={() => {
            setSelectedExercises(
              allSelected ? new Set() : new Set(MODE_OPTIONS),
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
  exercisesWrap: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  exerciseButton: {
    width: 150,
    height: 56,
  },
  exerciseLabel: {
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
