import { Tabs } from "expo-router";
import React, { Fragment } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Switch, View, StyleSheet, Text } from "react-native";
import { useUserTheme } from "@/providers/user-theme-provider";
import { ThemedText } from "@/components/themed-text";

export default function TabLayout() {
  const { theme, toggleTheme } = useUserTheme();
  const isDark: boolean = theme === "dark";

  return (
    <Fragment>
      <View
        style={[
          { backgroundColor: Colors[theme ?? "light"].background },
          styles.topBar,
        ]}
      >
        <ThemedText darkColor="white" lightColor="black" style={[styles.title]}>
          WhatToEat
        </ThemedText>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? "#fff" : "#000"}
          trackColor={{ false: "#ccc", true: "#666" }}
        />
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[theme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={20} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shopping"
          options={{
            title: "Shopping",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={20} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={20} name="paperplane.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: "Routine",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={20} name="paperplane.fill" color={color} />
            ),
          }}
        />
      </Tabs>
    </Fragment>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 8,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 20,
    letterSpacing: 2,
    fontFamily: "sans-serif",
    marginRight: "auto",
    marginLeft: 8,
  },
});
