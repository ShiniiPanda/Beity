import { MealData, MealSelection } from "../types/menu";
import { ShoppingListData } from "../types/shopping-list";
import {
  decode,
  readFileFromAPI,
  readFileFromCDN,
  updateFileWithSHA,
} from "./repo";

const BASE_PATH = "menu.json";

type UpdateMenuResponse = {
  ok: boolean;
  data?: MealData;
};

export async function getMenuData({
  recent = false,
}: {
  recent?: boolean;
}): Promise<MealData> {
  let data: MealData = {
    meals: {},
    lastModifiedAt: new Date().toString(),
    lastModifiedBy: "",
  };
  if (recent) {
    const APIFile = await readFileFromAPI(BASE_PATH);
    if (!APIFile) return data;
    const decodedContent = JSON.parse(decode(APIFile?.content)) as MealData;
    data = decodedContent;
  } else {
    const response = await readFileFromCDN<MealData>(BASE_PATH);
    if (response !== undefined) data = response;
  }
  return data;
}

export async function upsertMenuSelection(
  selection: MealSelection,
): Promise<UpdateMenuResponse> {
  const apiFile = await readFileFromAPI(BASE_PATH);
  if (apiFile === undefined) return { ok: false };
  try {
    await updateFileWithSHA(BASE_PATH, {}, "Updated Menu", apiFile.sha);
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}
