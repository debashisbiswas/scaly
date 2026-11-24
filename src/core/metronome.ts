import {
  AudioContext,
  OfflineAudioContext,
  type AudioBuffer,
  type OscillatorType,
} from "react-native-audio-api"

export type MetronomeOptions = {
  bpm: number
  volume?: number
}

const MIN_GAIN = 0.0001

const sanitizeBpm = (value: number) => Math.max(1, value)

async function renderClick(sampleRate: number) {
  const context = new OfflineAudioContext({
    numberOfChannels: 1,
    length: Math.ceil(sampleRate * 0.075),
    sampleRate,
  })

  const scheduleTone = ({
    type,
    frequency,
    peakGain,
    attackSeconds,
    decaySeconds,
    durationSeconds,
  }: {
    type: OscillatorType
    frequency: number
    peakGain: number
    attackSeconds: number
    decaySeconds: number
    durationSeconds: number
  }) => {
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()

    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, 0)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.78,
      durationSeconds,
    )

    gainNode.gain.setValueAtTime(MIN_GAIN, 0)
    gainNode.gain.exponentialRampToValueAtTime(peakGain, attackSeconds)
    gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, decaySeconds)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(0)
    oscillator.stop(durationSeconds)
  }

  scheduleTone({
    type: "triangle",
    frequency: 880,
    peakGain: 0.16,
    attackSeconds: 0.0015,
    decaySeconds: 0.055,
    durationSeconds: 0.075,
  })

  scheduleTone({
    type: "sine",
    frequency: 1760,
    peakGain: 0.065,
    attackSeconds: 0.0008,
    decaySeconds: 0.018,
    durationSeconds: 0.03,
  })

  return context.startRendering()
}

export function createMetronome(options: MetronomeOptions) {
  let audioContext: AudioContext | null = null
  let clickRender: Promise<AudioBuffer> | null = null
  let schedulerId: ReturnType<typeof setInterval> | null = null
  let nextBeatTime = 0
  let startVersion = 0
  let running = false
  let bpm = sanitizeBpm(options.bpm)

  const playClickAtTime = (
    context: AudioContext,
    buffer: AudioBuffer,
    time: number,
  ) => {
    const source = context.createBufferSource()
    const gainNode = context.createGain()

    source.buffer = buffer
    gainNode.gain.value = 10
    source.connect(gainNode)
    gainNode.connect(context.destination)

    source.onEnded = () => {
      source.disconnect()
      gainNode.disconnect()
    }

    source.start(time)
  }

  const scheduler = (context: AudioContext, buffer: AudioBuffer) => {
    const secondsToScheduleAhead = 0.1
    while (nextBeatTime < context.currentTime + secondsToScheduleAhead) {
      playClickAtTime(context, buffer, nextBeatTime)
      nextBeatTime += 60 / bpm
    }
  }

  const stop = () => {
    startVersion++
    if (schedulerId !== null) {
      clearInterval(schedulerId)
      schedulerId = null
    }

    running = false
  }

  const start = () => {
    if (running) {
      return
    }

    const context = (audioContext ??= new AudioContext())
    const render = (clickRender ??= renderClick(context.sampleRate))
    const version = startVersion
    running = true

    void render
      .then((buffer) => {
        if (version !== startVersion) {
          return
        }

        nextBeatTime = context.currentTime
        const tick = () => scheduler(context, buffer)
        schedulerId = setInterval(tick, 25)
        tick()
      })
      .catch((error) => {
        if (clickRender === render) {
          clickRender = null
        }
        if (version === startVersion) {
          stop()
          console.warn("Could not start metronome", error)
        }
      })
  }

  const dispose = () => {
    stop()
    clickRender = null

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
    isRunning: () => running,
  }
}
