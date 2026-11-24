import Ionicons from "@expo/vector-icons/Ionicons"
import { Pressable, StyleSheet, Text, View } from "react-native"

import type { Flow } from "@/core/flows"
import { formatDisplayPitchLabel } from "@/core/music/accidentals"
import { CLEF_GLYPHS } from "@/core/music/clefGlyphs"

export type FlowMasterySummary =
  | { kind: "new" }
  | { kind: "graded"; percent: number }
  | { kind: "unavailable" }

type CardProps = {
  flow: Flow
  mastery?: FlowMasterySummary
} & (
  | { selected: boolean; onSelect: () => void }
  | { onPlay: () => void; onEdit?: () => void; onDelete?: () => void }
)

const INK = "#202633"
const MUTED = "#526071"

function ConfigField({
  label,
  value,
  fullValue = value,
  more = 0,
  flexible = false,
}: {
  label: string
  value: string
  fullValue?: string
  more?: number
  flexible?: boolean
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${fullValue}`}
      style={[styles.field, flexible && styles.flex]}
    >
      <Text numberOfLines={1} style={styles.fieldValue}>
        {value}
      </Text>
      {more > 0 ? <Text style={styles.more}>+{more}</Text> : null}
    </View>
  )
}

function ConfigSummary({ config }: { config: Flow["config"] }) {
  const keys = (config.keys ?? []).map(formatDisplayPitchLabel)
  const modes = config.modes ?? []
  const keyLimit = 8
  const modeLimit = 2
  const range = config.range
    ? `${formatDisplayPitchLabel(config.range.low)}–${formatDisplayPitchLabel(config.range.high)}`
    : ""
  const tempo = config.tempo
  const tempoLabel = !tempo
    ? "—"
    : tempo.kind === "single"
      ? `${tempo.bpm} BPM`
      : `${tempo.minBpm}–${tempo.maxBpm} BPM`

  return (
    <View style={styles.config}>
      <View style={styles.configRow}>
        <ConfigField
          label="Range"
          flexible
          value={range || "—"}
          fullValue={range || "Not set"}
        />
        <ConfigField label="Tempo" value={tempoLabel} />
      </View>
      <ConfigField
        label="Keys"
        value={keys.slice(0, keyLimit).join(" · ") || "—"}
        fullValue={keys.join(", ") || "None"}
        more={keys.length - keyLimit}
      />
      <ConfigField
        label="Modes"
        value={modes.slice(0, modeLimit).join(" · ") || "—"}
        fullValue={modes.join(", ") || "None"}
        more={modes.length - modeLimit}
      />
    </View>
  )
}

function MasteryMeter({ mastery }: { mastery?: FlowMasterySummary }) {
  const graded = mastery?.kind === "graded"
  const percent = graded ? mastery.percent : 0
  const status = graded
    ? `${percent}%`
    : mastery?.kind === "new"
      ? "0%"
      : mastery?.kind === "unavailable"
        ? "Unavailable"
        : "Loading…"

  return (
    <View
      accessible
      accessibilityLabel={`Mastery: ${status}`}
      style={styles.mastery}
    >
      <View style={styles.track}>
        {graded ? (
          <View style={[styles.fill, { width: `${percent}%` }]} />
        ) : null}
      </View>
      <Text style={styles.status}>{status}</Text>
    </View>
  )
}

function CardAction({
  label,
  icon,
  variant,
  onPress,
}: {
  label: string
  icon: React.ComponentProps<typeof Ionicons>["name"]
  variant?: "primary" | "delete"
  onPress: () => void
}) {
  const primary = variant === "primary"
  const color = primary ? "#fff" : variant === "delete" ? "#794950" : INK

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        primary && styles.primaryAction,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} color={color} size={14} />
      {variant !== "delete" ? (
        <Text style={[styles.actionText, { color }]}>{label}</Text>
      ) : null}
    </Pressable>
  )
}

export function FlowLibraryCard(props: CardProps) {
  const { flow, mastery } = props
  const clef = flow.config.clef
  const clefGlyph = clef ? CLEF_GLYPHS[clef] : undefined
  const selection = "onSelect" in props ? props : null
  const selected = selection?.selected ?? false
  const card = (
    <View style={[styles.card, selected && styles.selectedCard]}>
      <View style={styles.header}>
        {clefGlyph ? (
          <Text
            accessible
            accessibilityLabel={clef ?? undefined}
            style={styles.clef}
          >
            {clefGlyph}
          </Text>
        ) : null}
        <Text numberOfLines={1} style={styles.title}>
          {flow.name}
        </Text>
        {selection ? (
          <View style={[styles.checkbox, selected && styles.checked]}>
            {selected ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : null}
          </View>
        ) : null}
      </View>
      {selection ? null : <ConfigSummary config={flow.config} />}
      <MasteryMeter mastery={mastery} />
      {"onPlay" in props ? (
        <View style={styles.actions}>
          <CardAction
            label="Play"
            icon="play"
            variant="primary"
            onPress={props.onPlay}
          />
          {props.onEdit ? (
            <CardAction
              label="Edit"
              icon="create-outline"
              onPress={props.onEdit}
            />
          ) : null}
          {props.onDelete ? (
            <CardAction
              label="Delete"
              icon="trash-outline"
              variant="delete"
              onPress={props.onDelete}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  )

  return selection ? (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={clefGlyph ? `${flow.name}, ${clef}` : flow.name}
      accessibilityState={{ checked: selected }}
      onPress={selection.onSelect}
      style={styles.flex}
    >
      {card}
    </Pressable>
  ) : (
    card
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "#e0e4ea",
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  selectedCard: { borderColor: "#7189ad", backgroundColor: "#dbe4f0" },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { color: INK, flex: 1, fontSize: 18, fontWeight: "700" },
  clef: {
    color: MUTED,
    fontFamily: "BravuraText",
    fontSize: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: MUTED,
    alignItems: "center",
    justifyContent: "center",
  },
  checked: { backgroundColor: "#526b90", borderColor: "#526b90" },
  config: {
    backgroundColor: "#e9edf2",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 3,
  },
  configRow: { flexDirection: "row", gap: 10 },
  field: { flexDirection: "row", alignItems: "center", gap: 7 },
  fieldValue: {
    color: INK,
    flexShrink: 1,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: "500",
  },
  more: { color: MUTED, fontSize: 11, fontWeight: "600" },
  mastery: { flexDirection: "row", alignItems: "center", gap: 9 },
  track: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#cbd2dc",
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: 3, backgroundColor: "#278264" },
  status: { color: MUTED, fontSize: 11, fontVariant: ["tabular-nums"] },
  actions: { flexDirection: "row", gap: 8 },
  action: {
    minWidth: 40,
    height: 36,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#d4dae3",
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: { fontSize: 13, fontWeight: "700" },
  primaryAction: { flex: 1, backgroundColor: "#2563d5" },
  pressed: { opacity: 0.68 },
})
