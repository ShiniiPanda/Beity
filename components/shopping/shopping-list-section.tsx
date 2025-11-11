import {
  ShoppingListRecord,
  UncommitedShoppingListRecord,
} from "@/data/types/shopping-list";
import { useThemeColor } from "@/hooks/use-theme-color";
import { PropsWithChildren } from "react";
import { TextStyle, Text, View, StyleSheet } from "react-native";
import { ThemedView } from "../themed-view";
import Animated from "react-native-reanimated";
import { ThemedText } from "../themed-text";

export function ShoppingListSection({
  length,
  title,
  titleStyle = {},
  children,
}: PropsWithChildren<{
  length: number;
  title: string;
  titleStyle?: TextStyle | TextStyle[];
}>) {
  const textColor = useThemeColor({}, "text");

  return (
    <ThemedView style={{ gap: 20 }}>
      <Text
        style={[
          {
            textAlign: "center",
            fontSize: 22,
            fontWeight: 500,
            color: textColor,
          },
          titleStyle,
        ]}
      >
        {title}
      </Text>
      <View
        style={{
          width: "100%",
          paddingVertical: 12,
          paddingHorizontal: 12,
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { opacity: 0.2, backgroundColor: "grey", borderRadius: 4 },
          ]}
        ></View>
        {length > 0 ? (
          <Animated.View
            style={{
              gap: 4,
              flexDirection: "column",
              alignItems: "stretch",
              justifyContent: "flex-start",
            }}
          >
            {children}
          </Animated.View>
        ) : (
          <View>
            <ThemedText style={{ color: textColor, textAlign: "center" }}>
              No entries were detected.
            </ThemedText>
          </View>
        )}
      </View>
    </ThemedView>
  );
}
