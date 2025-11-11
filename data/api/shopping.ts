import { useLocalShoppingRepository } from "../database/shoppingRepository";
import {
  ShoppingListData,
  ShoppingListRecord,
  UncommitedShoppingListData,
  UncommitedShoppingListRecord,
} from "../types/shopping-list";
import {
  APIFile,
  decode,
  readFileFromAPI,
  readFileFromCDN,
  updateFile,
  updateFileWithSHA,
} from "./repo";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";

const BASE_PATH = "shopping-list.json";

export type CommitChangesResponse = {
  ok: boolean;
  data?: ShoppingListData;
};

export function generateRandomShoppingUUID() {
  const randomID = uuid();
  return randomID;
}

export async function getShoppingListData({
  recent = false,
}: {
  recent?: boolean;
} = {}): Promise<ShoppingListData> {
  let data: ShoppingListData = { items: [] };
  if (recent) {
    const APIFile = await readFileFromAPI(BASE_PATH);
    if (!APIFile) return data;
    const decodedContent = JSON.parse(
      decode(APIFile?.content),
    ) as ShoppingListData;
    data = decodedContent;
  } else {
    const response = await readFileFromCDN<ShoppingListData>(BASE_PATH);
    if (response !== undefined) data = response;
  }
  return data;
}

export async function fulfillRecord(
  id: string,
): Promise<CommitChangesResponse> {
  const apiFile: APIFile | undefined = await readFileFromAPI(BASE_PATH);
  if (apiFile === undefined) return { ok: false };

  const shoppingData = JSON.parse(decode(apiFile.content)) as ShoppingListData;
  if (!shoppingData) return { ok: false };

  let changed = false;

  const newItems = [...shoppingData.items];

  for (const item of newItems) {
    if (item.id === id) {
      if (item.fulfilled === 0) {
        item.fulfilled = 1;
        item.fulfilledAt = new Date().toISOString();
        changed = true;
      }
    }
  }

  if (changed === false) {
    return { ok: true };
  }

  shoppingData.items = newItems;
  shoppingData.lastModifiedAt = new Date().toISOString();

  try {
    const response = await updateFileWithSHA(
      BASE_PATH,
      shoppingData,
      `Updated Shopping List, set record to fulfilled`,
      apiFile.sha,
    );
    return {
      ok: true,
      data: shoppingData,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  }
}

export async function commitShoppingListChanges(
  changes: UncommitedShoppingListData,
): Promise<CommitChangesResponse> {
  const apiFile: APIFile | undefined = await readFileFromAPI(BASE_PATH);
  if (apiFile === undefined) return { ok: false };

  const shoppingData = JSON.parse(decode(apiFile.content)) as ShoppingListData;
  if (!shoppingData) return { ok: false };

  const additions: ShoppingListRecord[] = [];
  const updates: Record<string, UncommitedShoppingListRecord> = {};

  for (const [key, value] of Object.entries(changes)) {
    const { action, ...entry } = value;
    if (action === "ADD") {
      additions.push(entry);
    } else {
      updates[key] = value;
    }
  }

  let newItems: ShoppingListRecord[] = [];

  if (Object.keys(updates).length > 0) {
    newItems = shoppingData.items
      .map((entry) => {
        const change = updates[entry.id];
        if (change === undefined) return entry;
        const { action, ...changedEntry } = change;
        if (action === "DELETE") {
          return null;
        } else {
          return changedEntry;
        }
      })
      .filter((entry) => entry !== null);
  } else {
    newItems = [...shoppingData.items];
  }

  newItems.push(...additions);

  shoppingData.items = newItems;
  shoppingData.lastModifiedAt = new Date().toISOString();

  try {
    const response = await updateFileWithSHA(
      BASE_PATH,
      shoppingData,
      `Updated Shopping List`,
      apiFile.sha,
    );
    return {
      ok: true,
      data: shoppingData,
    };
  } catch (e) {
    console.error(e);
    return {
      ok: false,
    };
  }
}
