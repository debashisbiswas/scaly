import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

export const flows = sqliteTable("flows", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  configJson: text("config_json").notNull(),
  progressPercent: integer("progress_percent").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

export const exercises = sqliteTable(
  "exercises",
  {
    id: text("id").primaryKey(),
    flowId: text("flow_id")
      .notNull()
      .references(() => flows.id, { onDelete: "cascade" }),
    exerciseKey: text("exercise_key").notNull(),
    key: text("key").notNull(),
    mode: text("mode").notNull(),
    startOctave: integer("start_octave").notNull(),
    octaves: integer("octaves").notNull(),
    clef: text("clef").notNull(),
    tempoKind: text("tempo_kind").notNull(),
    tempoBpm: integer("tempo_bpm"),
    tempoMinBpm: integer("tempo_min_bpm"),
    tempoMaxBpm: integer("tempo_max_bpm"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
  },
  (table) => [
    uniqueIndex("exercises_flow_key_uq").on(table.flowId, table.exerciseKey),
    index("exercises_flow_idx").on(table.flowId),
    index("exercises_due_archived_idx").on(table.archivedAt),
  ],
)
