import { useSQLiteContext } from "expo-sqlite";
import {
  ShoppingListRecord,
  UncommitedShoppingListRecord,
} from "../types/shopping-list";

export function useLocalShoppingRepository() {
  const db = useSQLiteContext();

  async function fetchById(
    id: string,
  ): Promise<UncommitedShoppingListRecord | null> {
    const result: UncommitedShoppingListRecord | null =
      await db.getFirstAsync<UncommitedShoppingListRecord>(
        "SELECT * FROM shopping WHERE id = ? LIMIT 1",
        [id],
      );
    return result;
  }

  async function fetchAll(
    fulfilled: boolean | undefined = undefined,
  ): Promise<Array<UncommitedShoppingListRecord>> {
    let result: Array<UncommitedShoppingListRecord> = [];
    if (fulfilled !== undefined) {
      result = await db.getAllAsync<UncommitedShoppingListRecord>(
        `SELECT * FROM shopping WHERE fulfilled = ${fulfilled ? 1 : 0}`,
      );
    } else {
      result = await db.getAllAsync<UncommitedShoppingListRecord>(
        "SELECT * FROM shopping",
      );
    }
    return result;
  }

  async function deleteById(id: string): Promise<boolean> {
    let result = await db.runAsync("DELETE FROM shopping WHERE id = ?", id);
    return result.changes > 0 ? true : false;
  }

  async function deleteAll(): Promise<number> {
    let result = await db.runAsync("DELETE FROM shopping");
    return result.changes;
  }

  async function insert(record: UncommitedShoppingListRecord) {
    const lastUpdated = new Date().toISOString();
    const result = await db.runAsync(
      "INSERT INTO shopping (id, value, fulfilled, quantity, location, priority, createdAt, lastUpdatedAt, action) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);",
      record.id,
      record.value,
      record.fulfilled,
      record.quantity,
      record.location ?? "",
      record.priority,
      record.createdAt,
      lastUpdated,
      record.action,
    );

    return result.lastInsertRowId;
  }

  async function update(record: UncommitedShoppingListRecord) {
    const lastUpdated = new Date().toISOString();
    const result = await db.runAsync(
      `
UPDATE shopping SET value = ?, quantity = ?, location = ?, priority = ?, lastUpdatedAt = ? WHERE id = ?
`,
      record.value,
      record.quantity,
      record.location ?? "",
      record.priority,
      lastUpdated,
      record.id,
    );
    return result.changes;
  }

  async function updatePriority(
    record: ShoppingListRecord,
    newPriority: number,
  ) {
    const lastUpdated = new Date().toISOString();
    const result = await db.runAsync(
      `
UPDATE shopping SET priority = ?, lastUpdatedAt = ? WHERE id = ?
`,
      newPriority,
      lastUpdated,
      record.id,
    );
    return result.changes;
  }

  return {
    insert,
    update,
    updatePriority,
    fetchById,
    fetchAll,
    deleteById,
    deleteAll,
  };
}
