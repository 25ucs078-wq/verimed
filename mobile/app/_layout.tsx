import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useVeriMedStore } from "../lib/store";
import { offlineDb } from "../lib/offlineDb";

const queryClient = new QueryClient();

export default function RootLayout() {
  const loadStats = useVeriMedStore((state) => state.loadStats);

  useEffect(() => {
    // Initialize offline database tables
    const init = async () => {
      await offlineDb.initDb();
      await loadStats();
    };
    init();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#070A18" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="result" options={{ presentation: "modal" }} />
          <Stack.Screen name="report" options={{ presentation: "modal" }} />
          <Stack.Screen name="sync" options={{ presentation: "modal" }} />
          <Stack.Screen name="profile" options={{ presentation: "modal" }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
