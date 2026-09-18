import { MusicXMLViewer } from "@/core/music/MusicXMLViewer"
import { generateScaleNotation } from "@/core/music/Scales"
import { MusicXML } from "@/core/music/musicxml"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { StyleSheet, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Scratchpad() {
  const router = useRouter()

  const score = generateScaleNotation({
    key: "C",
    mode: "major",
    rhythm: "sixteenths",
    slurPattern: "slur two tongue two",
    octaves: 1,
    startOctave: 4,
    clef: "treble",
  })

  const xml = MusicXML.render(score)

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={router.back}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <MusicXMLViewer musicXML={xml} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    backgroundColor: "#0a7ea4",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
})
