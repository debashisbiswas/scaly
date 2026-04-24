export function formatDisplayPitchLabel(label: string) {
  return label.replace(/#/g, "♯").replace(/b/g, "♭")
}
