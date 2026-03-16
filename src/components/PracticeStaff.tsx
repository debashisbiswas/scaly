import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import { generateMusicXMLForScale } from "@/core/music/Scales"
import { View } from "react-native"

interface PracticeStaffProps {
  mode: "full" | "rhythm"
  width: number
  height: number
}

export default function PracticeStaff({
  mode,
  width,
  height,
}: PracticeStaffProps) {
  const xml = generateMusicXMLForScale({
    key: "C",
    mode: "major",
    rhythm: "sixteenths",
    slurPattern: "slur two tongue two",
    octaves: 1,
    startOctave: 4,
  })

  return (
    <View
      style={{
        width,
        height,
        overflow: "hidden",
      }}
    >
      <MusicXMLViewer musicXML={xml} />
    </View>
  )
}
