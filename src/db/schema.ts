import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const flows = sqliteTable("flows", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  configJson: text("config_json").notNull(),
  progressPercent: integer("progress_percent").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})

export const flowDraft = sqliteTable("flow_draft", {
  id: integer("id").primaryKey(),
  draftJson: text("draft_json").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
})
