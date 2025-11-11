import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { PropsWithChildren } from "react";
import * as FileSystem from "expo-file-system/legacy";

const DATABASE_NAME = process.env.EXPO_PUBLIC_DATABASE_NAME;

export default function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider
      databaseName={DATABASE_NAME ? DATABASE_NAME : "data.db"}
      onInit={migrateDatabase}
      useSuspense
    >
      {children}
    </SQLiteProvider>
  );
}

const migrateDatabase = async (db: SQLiteDatabase) => {
  console.log(FileSystem.documentDirectory);
  const DATABASE_VERSION = 2;

  await db.runAsync(`UPDATE cache SET value = '{}' WHERE key = 'shopping'`);

  let result: { user_version: number } | null = await db.getFirstAsync<{
    user_version: number;
  }>("PRAGMA user_version");

  if (result === null) {
    // // const dbPath = `${FileSystem.Paths.bundle.uri}SQLite/${DATABASE_NAME}`;
    // try {
    //   const fileInfo = await FileSystem.getInfoAsync(dbPath);
    //   if (fileInfo.exists) {
    //     await FileSystem.deleteAsync(dbPath, { idempotent: true });
    //     console.log(`✅ Deleted database: ${dbName}`);
    //   } else {
    //     console.log(`ℹ️ Database not found: ${dbName}`);
    //   }
    // } catch (err) {
    //   console.error("❌ Failed to delete database:", err);
    // }
    console.error("Failed to query SQLite database user version.");
    return;
  }

  let currentDbVersion = result["user_version"];

  if (currentDbVersion >= DATABASE_VERSION) return;

  if (currentDbVersion === 0) {
    await db.execAsync(`
PRAGMA journal_mode = 'wal';
CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY NOT NULL, value TEXT DEFAULT '{}', lastUpdatedAt TEXT DEFAULT (datetime('now')));`);

    const insertStatement = await db.prepareAsync(
      "INSERT INTO cache (key, value, lastUpdatedAt) values ($key, $value, $lastUpdatedAt)",
    );

    try {
      insertStatement.executeAsync({
        $key: "shopping",
        $value: "{}",
        $lastUpdatedAt: `${new Date().toISOString()}`,
      });
      insertStatement.executeAsync({
        $key: "meal",
        $value: "{}",
        $lastUpdatedAt: `${new Date().toISOString()}`,
      });
      insertStatement.executeAsync({
        $key: "routine",
        $value: "{}",
        $lastUpdatedAt: `${new Date().toISOString()}`,
      });
    } finally {
      await insertStatement.finalizeAsync();
    }

    currentDbVersion = 1;
  }
  if (currentDbVersion === 1) {
    await db.execAsync(`
CREATE TABLE IF NOT EXISTS shopping (id TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL, fulfilled INTEGER DEFAULT 0, quantity REAL DEFAULT 0, location TEXT, priority INTEGER DEFAULT 0, action TEXT DEFAULT "ADD", createdAt TEXT DEFAULT (datetime('now')), lastUpdatedAt TEXT DEFAULT (datetime('now')));
      `);
    currentDbVersion = 2;
  }

  await db.execAsync(`
PRAGMA user_version = ${DATABASE_VERSION};
`);
};
