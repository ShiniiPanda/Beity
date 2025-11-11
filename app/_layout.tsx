import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { UserThemeProvider } from "@/providers/user-theme-provider";
import { Suspense } from "react";
import Loading from "@/components/loading";
import DatabaseProvider from "@/providers/sqlite-database-provider";
import { NetworkConnectivityProvider } from "@/providers/network-connectivity-provider";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <UserThemeProvider>
        <NetworkConnectivityProvider>
          <Suspense fallback={<Loading />}>
            <DatabaseProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="modal"
                  options={{ presentation: "modal", title: "Modal" }}
                />
              </Stack>
              <StatusBar style="auto" />
            </DatabaseProvider>
          </Suspense>
        </NetworkConnectivityProvider>
      </UserThemeProvider>
    </ThemeProvider>
  );
}
