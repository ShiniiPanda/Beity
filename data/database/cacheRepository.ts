import { useSQLiteContext } from "expo-sqlite";

export type Cache = {
  key: string;
  value: string;
  lastUpdatedAt: string;
};

export function useCacheRepository() {
  const db = useSQLiteContext();

  async function get(key: string): Promise<Cache | null> {
    const result = await db.getFirstAsync<Cache>(
      "SELECT * FROM cache WHERE key = ?",
      [key],
    );
    return result;
  }

  async function getAll(): Promise<Array<Cache>> {
    const result = await db.getAllAsync("SELECT * FROM cache");
    return result as Cache[];
  }

  async function set(key: string, value: string): Promise<number> {
    const lastUpdatedAt = new Date().toISOString();
    const result = await db.runAsync(
      `UPDATE cache SET value = ?, lastUpdatedAt = ? WHERE key = ?`,
      [value, lastUpdatedAt, key],
    );
    return result.changes;
  }

  async function clear(key: string): Promise<number> {
    const lastUpdatedAt = new Date().toISOString();
    const result = await db.runAsync(
      `UPDATE cache SET value = '{}', lastUpdatedAt = ? WHERE key = ?`,
      [lastUpdatedAt, key],
    );
    return result.changes;
  }

  return { get, getAll, set, clear };
}
