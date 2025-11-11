import {
  commitShoppingListChanges,
  generateRandomShoppingUUID,
} from "@/data/api/shopping";
import {
  ShoppingListData,
  ShoppingListRecord,
  UncommitedShoppingListData,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import {
  Action,
  ActionHandler,
} from "@/providers/shopping-list-entry-action-provider";
import { Alert } from "react-native";

export type UseShoppingActionsProps = {
  shoppingData: ShoppingListData;
  changes: UncommitedShoppingListData;
  updateShoppingData: (options?: { data?: ShoppingListData }) => Promise<void>;
  upsertChange: (record: UncommitedShoppingListRecord) => Promise<void>;
  discardChange: (id: string) => Promise<void>;
  discardAllChanges: () => Promise<void>;
};

export function useShoppingActions({
  shoppingData,
  changes,
  updateShoppingData,
  upsertChange,
  discardChange,
  discardAllChanges,
}: UseShoppingActionsProps): ActionHandler {
  // Fulfill a record from uncommitted/unfulfilled list to fulfilled list
  const completeRecord = async (
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    let fulfilledRecord: UncommitedShoppingListRecord = {
      ...record,
      fulfilled: 1,
      action: "action" in record ? record.action : "UPDATE",
    };
    const result = await commitShoppingListChanges({
      [record.id]: { ...fulfilledRecord },
    });

    if (result.ok) {
      if (result.data) {
        updateShoppingData({ data: result.data });
      } else {
        updateShoppingData();
      }
      if (changes[record.id] !== undefined) {
        await discardChange(record.id);
      }
    }
  };

  // Commit a record from uncommitted list to unfulfilled list
  const commitRecord = async (
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    if (!("action" in record)) return;
    const result = await commitShoppingListChanges({ [record.id]: record });
    if (result.ok) {
      await discardChange(record.id);
      if (result.data) {
        updateShoppingData({ data: result.data });
      } else {
        updateShoppingData();
      }
    }
  };

  // Add a new or existing record to uncommitted list
  const upsertRecordChange = async (
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    if (!("action" in record)) return;
    const newChange = { ...record };
    const action = record.action;
    // First time being added
    if (action === "ADD" && !record.id) {
      const newId = generateRandomShoppingUUID();
      newChange.id = newId;
    } else if (action === "DELETE") newChange.action = "UPDATE";
    await upsertChange(newChange);
  };

  const togglePriority = async (
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    const updatedRecord: UncommitedShoppingListRecord = {
      ...record,
      priority: record.priority === 0 ? 1 : 0,
      action: "UPDATE",
    };
    if ("action" in record && record.action === "ADD")
      updatedRecord.action = "ADD";

    await upsertChange(updatedRecord);
  };

  const deleteRecord = async (
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    const change: UncommitedShoppingListRecord = {
      ...record,
      action: "DELETE",
    };
    await upsertChange(change);
  };

  const commitAll = async () => {
    // TODO: add check for conflicts
    const result = await commitShoppingListChanges(changes);
    if (result.ok) {
      await discardAllChanges();
      if (result.data) {
        await updateShoppingData({ data: result.data });
      } else {
        await updateShoppingData();
      }
    } else {
      Alert.alert(
        "Failed to committ changes",
        "Changes were not committed due to an unexpected error, please try again later.",
        [{ text: "Okay", style: "cancel" }],
      );
    }
  };

  const discard = async (id: string) => {
    await discardChange(id);
  };

  const discardAll = async () => {
    Alert.alert(
      "Are you sure?",
      `Are you sure you want to clear ${changes.length} uncommitted changes?`,
      [
        {
          text: "Proceed",
          style: "destructive",
          onPress: async () => {
            await discardAllChanges();
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handler = async (
    action: Action,
    record: ShoppingListRecord | UncommitedShoppingListRecord,
  ) => {
    switch (action) {
      case "complete":
        await completeRecord(record);
        break;
      case "delete":
        await deleteRecord(record);
        break;
      case "priority":
        await togglePriority(record);
        break;
      case "commit":
        await commitRecord(record);
        break;
      case "upsert":
        await upsertRecordChange(record);
        break;
      case "discard":
        await discard(record.id);
        break;
      case "commitAll":
        await commitAll();
        break;
      case "discardAll":
        await discardAll();
        break;
      default:
        break;
    }
  };

  return handler;
}
