import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { registerHnBackgroundTask, unregisterHnBackgroundTask } from "@/api/notifications";
import { useArticlesPolling } from "@/hooks/useArticlesPolling";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useNotificationNavigation } from "@/hooks/useNotificationNavigation";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import { useEffect } from "react";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useArticlesPolling();
  useNotificationNavigation();
  const { appEnabled, osStatus } = useNotificationSettings();

  useEffect(() => {
    const syncTask = async () => {
      if (appEnabled && osStatus === "granted") {
        await registerHnBackgroundTask();
      } else {
        await unregisterHnBackgroundTask();
      }
    };
    syncTask();
  }, [appEnabled, osStatus]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="articleModal"
            options={{
              presentation: "modal",
              title: "",
              headerShown: true,
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaView>
  );
}
