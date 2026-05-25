import { AudioContext } from "react-native-audio-api"

const DEFAULT_SCHEDULE_AHEAD_TIME_SEC = 0.1
const DEFAULT_SCHEDULER_INTERVAL_MS = 25

export type MetronomeOptions = {
  bpm: number
}

export function createMetronome(options: MetronomeOptions) {
  let audioContext: AudioContext | null = null
  let schedulerId: NodeJS.Timeout | null = null
  let nextBeatTime = 0
  let running = false
  let bpm = options.bpm

  const getBeatIntervalSec = () => 60 / bpm

  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    return audioContext
  }

  const playClickAtTime = (time: number) => {
    const context = getAudioContext()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = "square"
    oscillator.frequency.value = 1200

    gainNode.gain.setValueAtTime(0.001, time)
    gainNode.gain.exponentialRampToValueAtTime(0.25, time + 0.002)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(time)
    oscillator.stop(time + 0.06)
  }

  const scheduler = () => {
    if (!audioContext) {
      return
    }

    while (
      nextBeatTime <
      audioContext.currentTime + DEFAULT_SCHEDULE_AHEAD_TIME_SEC
    ) {
      playClickAtTime(nextBeatTime)
      nextBeatTime += getBeatIntervalSec()
    }
  }

  const stop = () => {
    if (schedulerId) {
      clearInterval(schedulerId)
      schedulerId = null
    }

    running = false
  }

  const start = () => {
    if (running) {
      return
    }

    const context = getAudioContext()
    nextBeatTime = context.currentTime
    schedulerId = setInterval(scheduler, DEFAULT_SCHEDULER_INTERVAL_MS)
    scheduler()
    running = true
  }

  const dispose = () => {
    stop()

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  }

  const toggle = () => {
    if (running) {
      stop()
    } else {
      start()
    }

    return running
  }

  return {
    start,
    stop,
    toggle,
    dispose,
    setBpm: (nextBpm: number) => {
      bpm = nextBpm
    },
    isRunning: () => running,
  }
}
