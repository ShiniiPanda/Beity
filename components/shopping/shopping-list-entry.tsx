import { ShoppingListRecord } from "@/data/types/shopping-list";
import { useShoppingListActionHandler } from "@/providers/shopping-list-entry-action-provider";
import { ArrowUpToLine, Check, Pencil, X, Trash } from "lucide-react-native";
import { PropsWithChildren, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleProp,
  Text,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";

export function ShoppingListEntry({
  item,
  index,
  type,
  change,
  onEdit = () => {},
}: {
  item: ShoppingListRecord;
  index: number;
  type: "UNFULFILLED" | "UNCOMMITED" | "FULFILLED";
  change?: "UPDATE" | "DELETE" | "ADD";
  onEdit?: () => void;
}) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const handleAction = useShoppingListActionHandler();
  const accentColor = useMemo(() => {
    if (change === "UPDATE") {
      return "darkorange";
    } else if (change === "DELETE") {
      return "red";
    } else if (change === "ADD") {
      return "lime";
    } else {
      return "grey";
    }
  }, [change]);

  const [fulfillable, deletable, editable, cancellable] = useMemo((): [
    boolean,
    boolean,
    boolean,
    boolean,
  ] => {
    // Default states
    let fulfillable = false;
    let deletable = false;
    let editable = false;
    let cancellable = false;

    // If item is already fulfilled — nothing can be done
    if (type === "FULFILLED") return [false, false, false, false];

    // Uncommitted items: can be cancelled and edited
    if (type === "UNCOMMITED") {
      return [change === "ADD" ? true : false, false, true, true];
    }

    // All other types: editable and possibly fulfillable/deletable
    fulfillable = true;
    editable = true;
    deletable = true;

    return [fulfillable, deletable, editable, cancellable];
  }, [change, type]);

  return (
    <Animated.View
      style={{
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 12,
        alignItems: "center",
        backgroundColor: index % 2 === 0 ? "#3a3a3a" : "#2e2e2e",
        borderLeftColor: accentColor,
        borderRightColor: accentColor,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        paddingVertical: 8,
        borderRadius: 4,
        width: "100%",
      }}
    >
      <ActionPressable
        disabled={type === "FULFILLED"}
        style={{
          paddingHorizontal: 6,
          paddingVertical: 6,
          backgroundColor: item.priority > 0 ? "red" : "green",
          width: 48,
        }}
        onPress={() => handleAction("priority", item)}
      >
        <Animated.Text
          style={{ color: "white", fontWeight: 600, fontSize: 10 }}
        >
          {item.priority > 0 ? "HIGH" : "LOW"}
        </Animated.Text>
      </ActionPressable>
      <Animated.Text
        style={{
          color: "white",
          fontSize: 18,
          flex: 1,
        }}
      >
        {item.value}
      </Animated.Text>
      <Animated.View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: 70,
          alignItems: "center",
        }}
      >
        {type === "UNCOMMITED" && (
          <ActionPressable onPress={() => handleAction("commit", item)}>
            <ArrowUpToLine size={20} color="lime" />
          </ActionPressable>
        )}
        {fulfillable && (
          <ActionPressable onPress={() => handleAction("complete", item)}>
            <Check size={22} color="lime" />
          </ActionPressable>
        )}
        {editable && (
          <ActionPressable onPress={onEdit}>
            <Pencil size={20} color="darkorange" />
          </ActionPressable>
        )}
        {deletable && (
          <ActionPressable onPress={() => handleAction("delete", item)}>
            <Trash size={20} color="red" />
          </ActionPressable>
        )}
        {cancellable && (
          <ActionPressable onPress={() => handleAction("discard", item)}>
            <X size={24} color="red" />
          </ActionPressable>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function ActionPressable({
  children,
  onPress,
  style = {},
  disabled = false,
}: PropsWithChildren<{
  onPress: null | ((event: GestureResponderEvent) => void) | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  disabled?: boolean;
}>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          width: 22,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}
