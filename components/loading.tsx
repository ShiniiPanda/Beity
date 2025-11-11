import { StyleSheet } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

export default function Loading() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText>Loading...</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: 48,
    alignItems: "center",
  },
});
