// app/categories/[id].tsx
import { useEffect, useMemo } from "react";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Pressable,
  StyleSheet,
} from "react-native";
import { useMealsStore } from "../../src/stores/useMealsStore";
import { useShallow } from "zustand/shallow";

export default function CategoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const nav = useNavigation();

  const {
    bootstrapped,
    getCategoryById,
    loadMealsForCategory,
    mealsByCategory,
    loadingMealsByCategory,
  } = useMealsStore(
    useShallow((s) => ({
      bootstrapped: s.bootstrapped,
      getCategoryById: s.getCategoryById,
      loadMealsForCategory: s.loadMealsForCategory,
      mealsByCategory: s.mealsByCategory,
      loadingMealsByCategory: s.loadingMealsByCategory,
    }))
  );

  const category = useMemo(
    () => (id ? getCategoryById(id) : undefined),
    [id, getCategoryById]
  );

  useEffect(() => {
    nav.setOptions({ title: category?.title ?? "Category" });
  }, [nav, category?.title]);

  useEffect(() => {
    if (!bootstrapped || !id) return;
    if (mealsByCategory[id] || loadingMealsByCategory[id]) return;
    loadMealsForCategory(id);
  }, [
    bootstrapped,
    id,
    mealsByCategory,
    loadingMealsByCategory,
    loadMealsForCategory,
  ]);

  const meals = id ? mealsByCategory[id] ?? [] : [];
  const isLoading = id ? !!loadingMealsByCategory[id] : true;

  if (!bootstrapped || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Laden…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 12 }}>
      <FlatList
        data={meals}
        keyExtractor={(m) => m.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/meal/${item.id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.duration} min • {item.complexity} • {item.affordability}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: { padding: 14, borderRadius: 12, backgroundColor: "#111827" },
  title: { color: "#fff", fontSize: 16, fontWeight: "600" },
  meta: { color: "#cbd5e1", marginTop: 4 },
});
