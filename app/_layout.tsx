import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useMealsStore } from "../src/stores/useMealsStore";
import { ActivityIndicator, Text, View } from "react-native";

export default function RootLayout() {
  const bootstrapped = useMealsStore((s) => s.bootstrapped);
  const error = useMealsStore((s) => s.error);

  useEffect(() => {
    // Call init directly from the store
    useMealsStore.getState().init();
  }, []);

  if (!bootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Database initialiseren…</Text>
        {error ? (
          <Text style={{ marginTop: 8, color: "red" }}>{String(error)}</Text>
        ) : null}
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <Stack />
      <StatusBar style="light" />
    </>
  );
}
