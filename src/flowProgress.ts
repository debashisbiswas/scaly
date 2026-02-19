export const FLOW_PROGRESS = {
  chooseKeys: { index: 0, route: "/choose-keys" },
  chooseInstrument: { index: 1, route: "/choose-instrument" },
  chooseRange: { index: 2, route: "/choose-range" },
  chooseMode: { index: 3, route: "/choose-mode" },
  chooseTempo: { index: 4, route: "/choose-tempo" },
  chooseRhythmAndArticulation: {
    index: 5,
    route: "/choose-rhythm-and-articulation",
  },
  nameFlow: { index: 6, route: "/name-flow" },
} as const

export const FLOW_PROGRESS_TOTAL = Object.keys(FLOW_PROGRESS).length

export function getFlowProgressIndex(pathname: string) {
  const step = Object.values(FLOW_PROGRESS).find(
    ({ route }) => route === pathname,
  )
  return step?.index
}
