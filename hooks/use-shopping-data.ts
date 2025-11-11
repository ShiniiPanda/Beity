import { getShoppingListData } from "@/data/api/shopping";
import {
  useCacheRepository,
  type Cache,
} from "@/data/database/cacheRepository";
import { ShoppingListData } from "@/data/types/shopping-list";
import { useEffect, useState } from "react";

export function useShoppingData() {
  const { get: getCache, set: setCache } = useCacheRepository();
  const [shoppingData, setShoppingData] = useState<ShoppingListData>({
    items: [],
  });

  const updateShoppingData = async ({
    data = { items: [] },
  }: { data?: ShoppingListData } = {}) => {
    if (data) {
      setShoppingData(data);
      await setCache("shopping", JSON.stringify(data));
    } else {
      const onlineData = await fetchOnlineShoppingData({ recent: true });
      setShoppingData(onlineData);
      await setCache("shopping", JSON.stringify(onlineData));
    }
  };

  const fetchOnlineShoppingData = async ({
    recent = false,
  }: { recent?: boolean } = {}) => {
    const result = await getShoppingListData({ recent: recent });
    return result;
  };

  const fetchCachedShoppingData = async (): Promise<ShoppingListData> => {
    const cache: Cache | null = await getCache("shopping");
    if (cache === null)
      return {
        items: [],
      };
    const data = JSON.parse(cache.value) as ShoppingListData;
    return Object.keys(data).length > 0 ? data : { items: [] };
  };

  useEffect(() => {
    (async () => {
      const cachedData = await fetchCachedShoppingData();
      setShoppingData(cachedData);
      const onlineData = await fetchOnlineShoppingData();
      await updateShoppingData({ data: onlineData });
    })();
  }, []);

  return { shoppingData, updateShoppingData, fetchOnlineShoppingData };
}
