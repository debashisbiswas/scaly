import { AudioContext } from "react-native-audio-api"

export type DroneOptions = {
  frequency: number
}

export function createDrone(options: DroneOptions) {
  let audioContext: AudioContext | null = null
  let oscillator: ReturnType<AudioContext["createOscillator"]> | null = null
  let gainNode: ReturnType<AudioContext["createGain"]> | null = null
  let running = false
  let frequency = options.frequency

  const getAudioContext = () => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    return audioContext
  }

  const start = () => {
    if (running) {
      return
    }

    const context = getAudioContext()
    oscillator = context.createOscillator()
    gainNode = context.createGain()

    oscillator.type = "sine"
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0.001, context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03)

    oscillator.connect(gainNode)
    gainNode.connect(context.destination)

    oscillator.start(context.currentTime)
    running = true
  }

  const stop = () => {
    if (!running) {
      return
    }

    if (audioContext && oscillator && gainNode) {
      const stopAt = audioContext.currentTime + 0.03
      gainNode.gain.exponentialRampToValueAtTime(0.001, stopAt)
      oscillator.stop(stopAt)
    }

    oscillator = null
    gainNode = null
    running = false
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
    setFrequency: (nextFrequency: number) => {
      frequency = nextFrequency

      if (oscillator) {
        oscillator.frequency.value = nextFrequency
      }
    },
    isRunning: () => running,
  }
}
