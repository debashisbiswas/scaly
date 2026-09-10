export type DroneTransposition = "concert" | "bb" | "eb" | "f"

export type DroneTranspositionOption = {
  value: DroneTransposition
  label: string
  description: string
  semitones: number
}

export const DRONE_TRANSPOSITION_OPTIONS: readonly DroneTranspositionOption[] =
  [
    {
      value: "concert",
      label: "Concert pitch",
      description: "Written C sounds C",
      semitones: 0,
    },
    {
      value: "bb",
      label: "Bb instrument",
      description: "Written C sounds Bb",
      semitones: -2,
    },
    {
      value: "eb",
      label: "Eb instrument",
      description: "Written C sounds Eb",
      semitones: -9,
    },
    {
      value: "f",
      label: "F instrument",
      description: "Written C sounds F",
      semitones: -7,
    },
  ]

export function isDroneTransposition(
  value: string,
): value is DroneTransposition {
  return DRONE_TRANSPOSITION_OPTIONS.some((option) => option.value === value)
}

export function transposeDroneFrequency(
  frequency: number,
  transposition: DroneTransposition,
) {
  const option = DRONE_TRANSPOSITION_OPTIONS.find(
    (candidate) => candidate.value === transposition,
  )

  return frequency * 2 ** ((option?.semitones ?? 0) / 12)
}
