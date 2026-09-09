import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import { GeneratedExerciseSpec } from "@/core/flows"
import { getExerciseNotation } from "@/core/music/practiceNotation"
import { Text, View } from "react-native"

interface PracticeStaffProps {
  exerciseSpec: GeneratedExerciseSpec
  width: number
  height: number
}

export default function PracticeStaff({
  exerciseSpec,
  width,
  height,
}: PracticeStaffProps) {
  const notation = getExerciseNotation(exerciseSpec)

  return (
    <View
      style={{
        width,
        height,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {notation.status === "ready" ? (
        <MusicXMLViewer musicXML={notation.musicXML} />
      ) : (
        <Text
          style={{
            color: "#6b7280",
            fontSize: 20,
            textAlign: "center",
            paddingHorizontal: 24,
          }}
        >
          Notation for this exercise isn&apos;t available yet.
        </Text>
      )}
    </View>
  )
}
