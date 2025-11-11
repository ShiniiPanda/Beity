import {
  ShoppingListRecord,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { createContext, PropsWithChildren, useContext } from "react";

export type Action =
  | "complete"
  | "upsert"
  | "delete"
  | "commit"
  | "discard"
  | "commitAll"
  | "discardAll"
  | "priority";

export type ActionHandler = (
  action: Action,
  record: ShoppingListRecord | UncommitedShoppingListRecord,
) => Promise<void>;

const ShoppingListActionContext = createContext<ActionHandler>(
  async (action, record) => {},
);

export function ShoppingListActionProvider({
  handleAction,
  children,
}: PropsWithChildren<{ handleAction: ActionHandler }>) {
  return (
    <ShoppingListActionContext.Provider value={handleAction}>
      {children}
    </ShoppingListActionContext.Provider>
  );
}

export const useShoppingListActionHandler = () =>
  useContext(ShoppingListActionContext);
