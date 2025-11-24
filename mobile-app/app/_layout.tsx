import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "../hooks/useColorScheme";
import useBackgroundInit from "./_backgroundInit";
import { useEffect } from "react";
import { initLocalDb } from "../utils/messageUtils";
import { WarningsProvider } from "../components/WarningsProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useBackgroundInit();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  useEffect(() => {
    initLocalDb();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <WarningsProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </WarningsProvider>
  );
}
