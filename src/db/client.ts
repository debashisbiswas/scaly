import { openDatabaseSync } from "expo-sqlite"
import { drizzle } from "drizzle-orm/expo-sqlite"

const sqlite = openDatabaseSync("scaly.db")

export const db = drizzle(sqlite)
