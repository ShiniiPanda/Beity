import { ScrollView, StyleSheet } from "react-native";
import { SquarePlus, RefreshCcw } from "lucide-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useMemo, useState } from "react";
import type {
  ShoppingListRecord,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { useThemeColor } from "@/hooks/use-theme-color";
import ShoppingEntryModal from "@/components/shopping/shoppingEntryModal";
import { ShoppingListSection } from "@/components/shopping/shopping-list-section";
import { QuickAccessButton } from "@/components/shopping/quick-access-button";
import { ShoppingListActionProvider } from "@/providers/shopping-list-entry-action-provider";
import { useShoppingData } from "@/hooks/use-shopping-data";
import { useUncommittedChanges } from "@/hooks/use-uncommitted-changes";
import { useShoppingActions } from "@/hooks/use-shopping-actions";
import { ShoppingListEntry } from "@/components/shopping/shopping-list-entry";
import { TabPage } from "@/components/tab-page";

const DEFAULT_RECORD: UncommitedShoppingListRecord = {
  id: "",
  value: "",
  location: "",
  quantity: "",
  priority: 0,
  fulfilled: 0,
  fulfilledAt: "",
  createdAt: "",
  lastUpdatedAt: "",
  action: "ADD",
};

const getRecordTemplate = () => ({ ...DEFAULT_RECORD });

export default function ShoppingTab() {
  const { shoppingData, updateShoppingData } = useShoppingData();
  const { uncommittedChanges, upsertChange, discardChange, discardAll } =
    useUncommittedChanges();
  const actionHandler = useShoppingActions({
    shoppingData: shoppingData,
    changes: uncommittedChanges,
    updateShoppingData: updateShoppingData,
    discardChange: discardChange,
    discardAllChanges: discardAll,
    upsertChange: upsertChange,
  });

  const [selectedRecord, setSelectedRecord] =
    useState<UncommitedShoppingListRecord>(getRecordTemplate());

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const backgroundColor = useThemeColor({}, "background");

  const [fulfilledItems, unfulfilledItems] = useMemo(() => {
    const fulfilled: ShoppingListRecord[] = [];
    const unfulfilled: ShoppingListRecord[] = [];
    for (const item of shoppingData.items) {
      (item.fulfilled === 0 ? unfulfilled : fulfilled).push(item);
    }
    return [fulfilled, unfulfilled];
  }, [shoppingData.items]);

  const changes: UncommitedShoppingListRecord[] = useMemo(() => {
    if (!uncommittedChanges) return [];
    return Object.values(uncommittedChanges);
  }, [uncommittedChanges]);

  const isComitted = (id: string): "UPDATE" | "DELETE" | "ADD" | undefined => {
    const item: undefined | UncommitedShoppingListRecord =
      uncommittedChanges[id];
    return item === undefined ? undefined : item.action;
  };

  return (
    <TabPage title="Shopping List">
      <ShoppingListActionProvider handleAction={actionHandler}>
        <ShoppingEntryModal
          record={selectedRecord}
          visible={modalVisible && selectedRecord !== null}
          onCancel={() => setModalVisible(false)}
        />
        <ThemedView style={styles.quickAccessContainer}>
          <ThemedView
            style={{
              flexDirection: "row",
              gap: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <QuickAccessButton
              onPress={() => {
                setSelectedRecord(getRecordTemplate());
                setModalVisible(true);
              }}
              color="green"
            >
              <SquarePlus size={16} color="white" />
            </QuickAccessButton>
            <QuickAccessButton
              onPress={() => {
                setSelectedRecord(getRecordTemplate());
                setModalVisible(true);
              }}
              color="green"
            >
              <RefreshCcw size={16} color="white" />
            </QuickAccessButton>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.contentContainer}>
          <ShoppingListSection
            title="Uncommitted Changes"
            length={changes.length}
          >
            {changes.map((change, index) => {
              return (
                <ShoppingListEntry
                  key={change.id}
                  item={change}
                  type="UNCOMMITED"
                  index={index}
                  onEdit={() => {
                    setSelectedRecord(change);
                    setModalVisible(true);
                  }}
                  change={change.action}
                />
              );
            })}
          </ShoppingListSection>
          <ShoppingListSection
            title="Unfulfilled Items"
            length={unfulfilledItems.length}
          >
            {unfulfilledItems.map((item, index) => {
              return (
                <ShoppingListEntry
                  key={item.id}
                  item={item}
                  type="UNFULFILLED"
                  index={index}
                  onEdit={() => {
                    setSelectedRecord({ ...item, action: "UPDATE" });
                    setModalVisible(true);
                  }}
                  change={isComitted(item.id)}
                />
              );
            })}
          </ShoppingListSection>
          <ShoppingListSection
            title="Recently Fulfilled"
            length={fulfilledItems.length}
          >
            {fulfilledItems.map((item, index) => {
              return (
                <ShoppingListEntry
                  item={item}
                  type="FULFILLED"
                  index={index}
                  key={item.id}
                />
              );
            })}
          </ShoppingListSection>
        </ThemedView>
      </ShoppingListActionProvider>
    </TabPage>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  parentContainer: {
    paddingHorizontal: 32,
    paddingVertical: 48,
    gap: 20,
    flex: 1,
  },
  routineListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
    paddingVertical: 48,
  },
  contentContainer: {
    paddingVertical: 20,
    gap: 16,
    justifyContent: "center",
  },
  quickAccessContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  seperator: {
    width: "80%",
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "white",
  },
});
