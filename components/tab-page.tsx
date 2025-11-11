import { ScrollView, StyleSheet } from "react-native";
import { ThemedView } from "./themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PropsWithChildren } from "react";
import { ThemedText } from "./themed-text";

export function TabPage({
  children,
  title,
}: PropsWithChildren<{ title?: string }>) {
  const backgroundColor = useThemeColor({}, "background");
  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor }}>
        <ThemedView style={styles.parentContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">{title}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.childrenContainer}>{children}</ThemedView>
        </ThemedView>
      </ScrollView>
    </>
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
    flex: 1,
  },
  childrenContainer: {
    paddingVertical: 20,
  },
});
