import { useEffect, useRef, useState } from "react"
import { View, ImageBackground } from "react-native"
import { useRouter } from "expo-router"
import MainScreenButton from "@/components/MainScreenButton"
import { useFlowStore } from "@/providers/FlowStoreProvider"
import { AudioContext } from "react-native-audio-api"

import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import * as SQLite from "expo-sqlite"

const DEBUG = false
const db = SQLite.openDatabaseSync("scaly.db")

export default function Index() {
  const router = useRouter()
  const { resetDraft } = useFlowStore()
  useDrizzleStudio(db)

  const audioContextRef = useRef<AudioContext | null>(null)
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const nextBeatTimeRef = useRef(0)
  const [isMetronomeRunning, setIsMetronomeRunning] = useState(false)

  const BPM = 100
  const beatIntervalSec = 60 / BPM
  const SCHEDULE_AHEAD_TIME_SEC = 0.1
  const SCHEDULER_INTERVAL_MS = 25

  const playClickAtTime = (time: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    const audioContext = audioContextRef.current
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.type = "square"
    oscillator.frequency.value = 1200

    gainNode.gain.setValueAtTime(0.001, time)
    gainNode.gain.exponentialRampToValueAtTime(0.25, time + 0.002)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start(time)
    oscillator.stop(time + 0.06)
  }

  const scheduler = () => {
    if (!audioContextRef.current) {
      return
    }

    const audioContext = audioContextRef.current
    while (
      nextBeatTimeRef.current <
      audioContext.currentTime + SCHEDULE_AHEAD_TIME_SEC
    ) {
      playClickAtTime(nextBeatTimeRef.current)
      nextBeatTimeRef.current += beatIntervalSec
    }
  }

  const handleMetronomeToggle = () => {
    if (isMetronomeRunning) {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current)
        schedulerRef.current = null
      }
      setIsMetronomeRunning(false)
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    nextBeatTimeRef.current = audioContextRef.current.currentTime + 0.01
    schedulerRef.current = setInterval(scheduler, SCHEDULER_INTERVAL_MS)
    scheduler()
    setIsMetronomeRunning(true)
  }

  useEffect(
    () => () => {
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    },
    [],
  )

  return (
    <ImageBackground
      source={require("../../assets/images/mainsplash.png")}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
      resizeMode="cover"
    >
      <View
        style={{
          gap: 40,
          width: 232,
        }}
      >
        <MainScreenButton
          title="Create Flow"
          onPress={() => {
            resetDraft()
            router.push("/choose-keys")
          }}
        />
        <MainScreenButton
          title="Flow Library"
          onPress={() => router.push("/flow-library")}
        />
        <MainScreenButton
          title={`metronome ${isMetronomeRunning ? "stop" : "start"}`}
          onPress={handleMetronomeToggle}
        />
        {DEBUG && (
          <MainScreenButton
            title="dev"
            onPress={() => router.push("/scratchpad")}
          />
        )}
      </View>
    </ImageBackground>
  )
}
