import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  ViewStyle,
} from "react-native";
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { useState } from "react";
import { useUserTheme } from "@/providers/user-theme-provider";

export default function ConfirmationModal({
  visible,
  onSuccess,
  onCancel,
  disabled = false,
}: {
  visible: boolean;
  onSuccess: (actor: string) => Promise<void>;
  onCancel: () => void;
  disabled?: boolean;
}) {
  const { theme } = useUserTheme();
  const [actor, setActor] = useState<string>("");
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
            padding: 20,
            width: 350,
            gap: 20,
            elevation: 4,
          }}
        >
          <ThemedView
            style={{
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              backgroundColor: "white",
            }}
          >
            <ThemedText
              darkColor={"black"}
              type="default"
              style={styles.inputTitle}
            >
              Actor
            </ThemedText>
            <TextInput
              style={styles.input}
              value={actor}
              onChangeText={(newActor: string) => setActor(newActor)}
              placeholder="Who performed this task?"
            ></TextInput>
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
              text="Perform"
              color="green"
              onClick={() => onSuccess(actor)}
            />
            <Option text="Cancel" color="red" onClick={onCancel} />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
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
    fontSize: 20,
  },
  input: {
    textAlign: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 50,
    width: "100%",
    fontSize: 16,
    backgroundColor: "white",
    borderColor: "transparent",
    borderWidth: 2.5,
    borderRadius: 4,
    elevation: 4,
  },
});
