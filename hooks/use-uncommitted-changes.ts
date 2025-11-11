import { generateRandomShoppingUUID } from "@/data/api/shopping";
import { useLocalShoppingRepository } from "@/data/database/shoppingRepository";
import {
  UncommitedShoppingListData,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { useEffect, useState } from "react";

export function useUncommittedChanges() {
  const { fetchAll, deleteAll, insert, deleteById, update } =
    useLocalShoppingRepository();
  const [uncommittedChanges, setUncommittedChanges] =
    useState<UncommitedShoppingListData>({});

  const upsertChange = async (record: UncommitedShoppingListRecord) => {
    const newRecord = {
      ...record,
      id: record.id ?? generateRandomShoppingUUID(),
    };
    const exists = uncommittedChanges[newRecord.id] !== undefined;
    if (exists) {
      await update(record);
    } else {
      await insert(record);
    }
    setUncommittedChanges((prev) => ({
      ...prev,
      [newRecord.id]: { ...newRecord },
    }));
  };

  const discardChange = async (id: string) => {
    setUncommittedChanges((prev) => {
      const newChanges = { ...prev };
      delete newChanges[id];
      return newChanges;
    });
    await deleteById(id);
  };

  const discardAllChanges = async () => {
    setUncommittedChanges({});
    await deleteAll();
  };

  // Initial Load From Local Uncommitted List
  useEffect(() => {
    (async () => {
      const changes = await fetchAll();
      const lookup: UncommitedShoppingListData = Object.fromEntries(
        changes.map((record) => [record.id, record]),
      );
      setUncommittedChanges(lookup);
    })();
  }, []);

  return {
    uncommittedChanges,
    upsertChange,
    discardChange,
    discardAll: discardAllChanges,
  };
}
