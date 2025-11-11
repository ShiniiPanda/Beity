import {
  ShoppingListData,
  UncommitedShoppingListData,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { Dispatch, SetStateAction } from "react";
import { Alert, View } from "react-native";
import { ShoppingListSection } from "./shopping-list-section";
import { ThemedView } from "../themed-view";
import { QuickAccessButton } from "./quick-access-button";
import {
  CommitChangesResponse,
  commitShoppingListChanges,
} from "@/data/api/shopping";
import { useLocalShoppingRepository } from "@/data/database/shoppingRepository";

type UncommitedChangesListProps = {
  uncommittedChanges: UncommitedShoppingListData;
  setUncommittedChanges: Dispatch<SetStateAction<UncommitedShoppingListData>>;
  setProcessing: Dispatch<SetStateAction<boolean>>;
  updateOnlineList: (options: {
    data?: ShoppingListData;
    sha?: string;
  }) => Promise<void>;
};

export function UncommitedChangesList({
  uncommittedChanges,
  setUncommittedChanges,
  setProcessing,
  updateOnlineList,
}: UncommitedChangesListProps) {
  const { deleteAll } = useLocalShoppingRepository();
  const uncommittedValues = Object.values(uncommittedChanges);

  const handleCommitChanges = async () => {
    setProcessing(true);
    const result: CommitChangesResponse =
      await commitShoppingListChanges(uncommittedChanges);
    setProcessing(false);
    if (!result.ok) {
      Alert.alert(
        "Failed to committ changes",
        "Changes were not committed due to an unexpected error, please try again later.",
        [{ text: "Okay", style: "cancel" }],
      );
    } else {
      await deleteAll();
      if (result.data !== undefined) {
        await updateOnlineList({ data: result.data });
      } else {
        await updateOnlineList({ sha: result.sha });
      }
      setUncommittedChanges({});
    }
  };

  const handleClearChanges = async () => { };

  if (uncommittedValues.length === 0) {
    return <></>;
  }

  return (
    <View style={{ gap: 12, justifyContent: "center", alignItems: "center" }}>
      <ShoppingListSection<UncommitedShoppingListRecord>
        data={Object.values(uncommittedChanges)}
        title="Uncommitted Changes"
      ></ShoppingListSection>
      <ThemedView style={{ gap: 8, paddingHorizontal: 12 }}>
        <QuickAccessButton onPress={handleCommitChanges} color="darkorange">
          Commit All Changes
        </QuickAccessButton>
        <QuickAccessButton onPress={handleClearChanges} color="red">
          Clear List
        </QuickAccessButton>
      </ThemedView>
    </View>
  );
}
