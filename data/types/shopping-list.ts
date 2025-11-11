export interface ShoppingListRecord {
  id: string;
  value: string;
  quantity: string;
  location?: string;
  priority: number;
  createdAt: string;
  lastUpdatedAt: string;
  fulfilledAt?: string;
  fulfilled: number;
}

export interface UncommitedShoppingListRecord extends ShoppingListRecord {
  action: "ADD" | "UPDATE" | "DELETE";
}

export type UncommitedShoppingListData = Record<
  string,
  UncommitedShoppingListRecord
>;

export type ShoppingListData = {
  items: ShoppingListRecord[];
  lastModifiedAt?: string;
  lastModifiedBy?: string;
  proneThresholdInMonths?: number;
};
