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

export const exercisePracticeStats = sqliteTable(
  "exercise_practice_stats",
  {
    exerciseId: text("exercise_id")
      .primaryKey()
      .references(() => exercises.id, { onDelete: "cascade" }),
    totalAttempts: integer("total_attempts").notNull(),
    againCount: integer("again_count").notNull(),
    hardCount: integer("hard_count").notNull(),
    goodCount: integer("good_count").notNull(),
    easyCount: integer("easy_count").notNull(),
    lastRating: text("last_rating"),
    lastRatedAt: integer("last_rated_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("exercise_practice_stats_last_rated_idx").on(table.lastRatedAt),
  ],
)
