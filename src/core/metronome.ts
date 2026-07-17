import { AudioContext } from "react-native-audio-api"

export type MetronomeOptions = {
  bpm: number
  volume?: number
}

const MIN_GAIN = 0.0001

const sanitizeBpm = (value: number) => Math.max(1, value)

const sanitizeVolume = (value: number | undefined) =>
  Math.min(1, Math.max(0, value ?? 1))

export function createMetronome(options: MetronomeOptions) {
  let audioContext: AudioContext | null = null
  let schedulerId: NodeJS.Timeout | null = null
  let nextBeatTime = 0
  let running = false
  let bpm = sanitizeBpm(options.bpm)
  let volume = sanitizeVolume(options.volume)

  const getOrCreateAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    return audioContext
  }

  const scheduleTone = ({
    time,
    type,
    frequency,
    peakGain,
    attackSeconds,
    decaySeconds,
    durationSeconds,
  }: {
    time: number
    type: OscillatorType
    frequency: number
    peakGain: number
    attackSeconds: number
    decaySeconds: number
    durationSeconds: number
  }) => {
    const context = getOrCreateAudioContext()
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, time)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.78,
      time + durationSeconds,
    )

    gainNode.gain.setValueAtTime(MIN_GAIN, time)
    gainNode.gain.exponentialRampToValueAtTime(
      Math.max(MIN_GAIN, peakGain * volume),
      time + attackSeconds,
    )
    gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, time + decaySeconds)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.onEnded = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }

    oscillator.start(time)
    oscillator.stop(time + durationSeconds)
  }

  const playClickAtTime = (time: number) => {
    const bodyFrequency = 880

    scheduleTone({
      time,
      type: "triangle",
      frequency: bodyFrequency,
      peakGain: 0.16,
      attackSeconds: 0.0015,
      decaySeconds: 0.055,
      durationSeconds: 0.075,
    })

    scheduleTone({
      time,
      type: "sine",
      frequency: bodyFrequency * 2,
      peakGain: 0.065,
      attackSeconds: 0.0008,
      decaySeconds: 0.018,
      durationSeconds: 0.03,
    })
  }

  const scheduler = () => {
    if (!audioContext) {
      return
    }

    const secondsToScheduleAhead = 0.1
    while (nextBeatTime < audioContext.currentTime + secondsToScheduleAhead) {
      playClickAtTime(nextBeatTime)
      nextBeatTime += 60 / bpm
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

    const context = getOrCreateAudioContext()
    nextBeatTime = context.currentTime

    const schedulerIntervalMs = 25
    schedulerId = setInterval(scheduler, schedulerIntervalMs)
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
      bpm = sanitizeBpm(nextBpm)
    },
    setVolume: (nextVolume: number) => {
      volume = sanitizeVolume(nextVolume)
    },
    isRunning: () => running,
  }
}
