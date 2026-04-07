import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import { GeneratedExerciseSpec } from "@/core/flows"
import { generateMusicXMLForScale } from "@/core/music/Scales"
import { View } from "react-native"

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
  const xml = generateMusicXMLForScale({
    key: exerciseSpec.key,
    mode: exerciseSpec.mode,
    rhythm: "sixteenths",
    slurPattern: "tongued",
    octaves: exerciseSpec.octaves,
    startOctave: exerciseSpec.startOctave,
    clef: exerciseSpec.clef
  })

  return (
    <View style={{ width, height }}>
      <MusicXMLViewer musicXML={xml} />
    </View>
  )
}
