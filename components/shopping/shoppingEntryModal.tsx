import {
  Alert,
  KeyboardTypeOptions,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
} from "react-native";
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { useEffect, useRef, useState } from "react";
import {
  ShoppingListRecord,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { useShoppingListActionHandler } from "@/providers/shopping-list-entry-action-provider";

const shallowCompare = (
  recordOne: ShoppingListRecord,
  recordTwo: ShoppingListRecord,
): boolean => {
  if (recordOne.value !== recordTwo.value) {
    return false;
  }
  if (recordOne.quantity !== recordTwo.quantity) {
    return false;
  }
  if (recordOne.location !== recordTwo.location) {
    return false;
  }
  if (recordOne.priority !== recordTwo.priority) {
    return false;
  }
  return true;
};

export default function ShoppingEntryModal({
  record,
  visible,
  onCancel,
  onSuccess,
  disabled = false,
}: {
  record: UncommitedShoppingListRecord;
  visible: boolean;
  onCancel: () => void;
  onSuccess?: (record: UncommitedShoppingListRecord) => void;
  disabled?: boolean;
}) {
  const actionHandler = useShoppingListActionHandler();
  const [updatedRecord, setUpdatedRecord] =
    useState<UncommitedShoppingListRecord>(record);

  const originalEntry = useRef<UncommitedShoppingListRecord>({ ...record });

  useEffect(() => {
    originalEntry.current = { ...record };
    setUpdatedRecord(record);
  }, [record]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <ThemedView
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            paddingVertical: 30,
            paddingHorizontal: 20,
            width: 350,
            gap: 40,
            elevation: 4,
          }}
        >
          <ThemedView
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              backgroundColor: "white",
            }}
          >
            <ModalTextInput
              name="Item"
              value={updatedRecord.value}
              onChangeText={(value: string) =>
                setUpdatedRecord((prev) => ({ ...prev, value: value }))
              }
              placeholder="What to buy?"
              keyboardType="default"
            />
            <ModalTextInput
              name="Location"
              value={updatedRecord.location ?? ""}
              onChangeText={(location: string) =>
                setUpdatedRecord((prev) => ({ ...prev, location: location }))
              }
              placeholder="Where to get it?"
              keyboardType="default"
            />
            <ModalTextInput
              name="Quantity"
              value={updatedRecord.quantity}
              onChangeText={(value: string) => {
                let sanitized = value.replace(/[^0-9.]/g, "");
                const parts = sanitized.split(".");
                if (parts.length > 2) {
                  sanitized = parts[0] + "." + parts.slice(1).join("");
                }
                setUpdatedRecord((prev) => ({
                  ...prev,
                  quantity: sanitized,
                }));
              }}
              placeholder="How Many?"
              keyboardType="decimal-pad"
            />
          </ThemedView>
          <ThemedView
            style={{
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 20,
            }}
          >
            <Option
              text={record.action === "ADD" ? "Add" : "Edit"}
              color="green"
              onClick={() => {
                const changed = originalEntry.current
                  ? !shallowCompare(originalEntry.current, updatedRecord)
                  : true;
                if (!changed && record.action === "UPDATE") {
                  Alert.alert(
                    "No updates detected.",
                    "You have not changed this entry. If you apply an update, it will appear in your uncommitted list. Would you still like to proceed?",
                    [
                      {
                        text: "Proceed",
                        style: "default",
                        onPress: () => actionHandler("upsert", updatedRecord),
                      },
                      {
                        text: "Abort",
                        style: "cancel",
                        onPress: () => onCancel(),
                      },
                    ],
                  );
                  return;
                }
                actionHandler("upsert", updatedRecord);
              }}
            />
            <Option text="Cancel" color="red" onClick={onCancel} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

function ModalTextInput({
  name,
  value,
  onChangeText = (val) => { },
  placeholder = "",
  keyboardType = "default",
}: {
  name: string;
  value: string;
  onChangeText: (val: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions | undefined;
}) {
  return (
    <View style={{ width: "100%" }}>
      <ThemedText darkColor={"grey"} type="default" style={styles.inputTitle}>
        {name}
      </ThemedText>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
      ></TextInput>
    </View>
  );
}

function Option({
  text,
  color,
  onClick,
  style,
  disabled = false,
}: {
  color: string;
  text: string;
  onClick: () => void;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onClick}
      disabled={disabled}
      style={[styles.pressable, { backgroundColor: color }, style]}
    >
      <ThemedText
        type="default"
        lightColor="white"
        darkColor="white"
        style={{
          textAlign: "center",
        }}
      >
        {text}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: 120,
    elevation: 5,
    borderRadius: 4,
    paddingVertical: 8,
  },
  inputTitle: {
    fontSize: 16,
  },
  input: {
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 50,
    width: "100%",
    fontSize: 14,
    backgroundColor: "white",
    borderColor: "transparent",
    borderWidth: 2.5,
    borderRadius: 4,
    elevation: 4,
  },
});
