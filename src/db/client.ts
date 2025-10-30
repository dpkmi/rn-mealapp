import * as SQLite from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { type SQLiteDatabase } from "expo-sqlite";

let _sqlite: SQLiteDatabase | null = null;

export function getRawDb() {
  if (!_sqlite) _sqlite = SQLite.openDatabaseSync("meals.db");
  return _sqlite;
}

export const db = drizzle(getRawDb());
