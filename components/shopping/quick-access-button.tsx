import { PropsWithChildren } from "react";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "../themed-text";

const DEFAULT_QUICK_ACCESS_COLORS = { lightColor: "white", darkColor: "white" };

export function QuickAccessButton({
  onPress,
  color = "green",
  children,
}: PropsWithChildren<{ color?: string; onPress: () => void }>) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pressable, { backgroundColor: color }]}
    >
      <ThemedText {...DEFAULT_QUICK_ACCESS_COLORS} style={styles.pressableText}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "green",
    borderRadius: 16,
    justifyContent: "center",
    width: 100,
  },
  pressableText: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: 500,
  },
});
