import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import { GeneratedExerciseSpec } from "@/core/flows"
import { generateMusicXMLForScale } from "@/core/music/Scales"
import { View } from "react-native"

interface PracticeStaffProps {
  exerciseSpec: GeneratedExerciseSpec
  mode: "full" | "rhythm"
  width: number
  height: number
}

export default function PracticeStaff({
  exerciseSpec,
  mode,
  width,
  height,
}: PracticeStaffProps) {
  const xml = generateMusicXMLForScale({
    key: mode === "rhythm" ? "C" : exerciseSpec.key,
    mode: mode === "rhythm" ? "major" : exerciseSpec.mode,
    rhythm: exerciseSpec.rhythm,
    slurPattern: exerciseSpec.slurPattern,
    octaves: mode === "rhythm" ? 1 : exerciseSpec.octaves,
    startOctave: mode === "rhythm" ? 4 : exerciseSpec.startOctave,
  })

  const viewerHeight =
    mode === "full" ? Math.max(180, Math.min(height, 320)) : height

  return (
    <View style={{ width, height: viewerHeight }}>
      <MusicXMLViewer musicXML={xml} />
    </View>
  )
}
