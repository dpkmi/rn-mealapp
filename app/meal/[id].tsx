// app/meal/[id].tsx
import { useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
} from "react-native";
import { useMealsStore } from "../../src/stores/useMealsStore";
import { useShallow } from "zustand/shallow";

export default function MealDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const nav = useNavigation();

  const {
    bootstrapped,
    loadMeal,
    mealsById,
    mealIngredientsById,
    mealStepsById,
    loadingMealById,
  } = useMealsStore(
    useShallow((s) => ({
      bootstrapped: s.bootstrapped,
      loadMeal: s.loadMeal,
      mealsById: s.mealsById,
      mealIngredientsById: s.mealIngredientsById,
      mealStepsById: s.mealStepsById,
      loadingMealById: s.loadingMealById,
    }))
  );

  useEffect(() => {
    if (!bootstrapped || !id) return;
    // Only skip if we have ingredients AND steps loaded (not just the meal)
    if ((mealIngredientsById[id] && mealStepsById[id]) || loadingMealById[id])
      return;
    loadMeal(id);
  }, [
    bootstrapped,
    id,
    mealIngredientsById,
    mealStepsById,
    loadingMealById,
    loadMeal,
  ]);

  const meal = id ? mealsById[id] : undefined;
  const ingredients = id ? mealIngredientsById[id] ?? [] : [];
  const steps = id ? mealStepsById[id] ?? [] : [];
  const isLoading = !bootstrapped || (id ? !!loadingMealById[id] : true);

  useEffect(() => {
    nav.setOptions({ title: meal?.title ?? "Meal" });
  }, [nav, meal?.title]);

  if (isLoading || !meal) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading meal...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: meal.imageUrl }}
        style={{
          width: "100%",
          height: 200,
          borderRadius: 8,
          marginBottom: 16,
        }}
      />
      <Text style={styles.title}>{meal.title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{meal.duration} min</Text>
        <Text style={styles.metaText}>{meal.complexity}</Text>
        <Text style={styles.metaText}>{meal.affordability}</Text>
      </View>

      <View style={styles.tags}>
        {meal.isVegan && <Text style={styles.tag}>🌱 Vegan</Text>}
        {meal.isVegetarian && <Text style={styles.tag}>🥬 Vegetarian</Text>}
        {meal.isGlutenFree && <Text style={styles.tag}>🌾 Gluten-Free</Text>}
        {meal.isLactoseFree && <Text style={styles.tag}>🥛 Lactose-Free</Text>}
      </View>

      <Text style={styles.sectionTitle}>Ingredients</Text>
      {ingredients.map((ing) => (
        <Text key={ing.order} style={styles.listItem}>
          • {ing.text}
        </Text>
      ))}

      <Text style={styles.sectionTitle}>Steps</Text>
      {steps.map((step) => (
        <View key={step.order} style={styles.stepItem}>
          <Text style={styles.stepNumber}>{step.order + 1}</Text>
          <Text style={styles.stepText}>{step.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 16, backgroundColor: "#000" },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  metaText: { color: "#cbd5e1", fontSize: 14 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  tag: {
    backgroundColor: "#1f2937",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 12,
  },
  listItem: { color: "#cbd5e1", fontSize: 14, marginBottom: 8 },
  stepItem: { flexDirection: "row", gap: 12, marginBottom: 16 },
  stepNumber: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#1f2937",
    width: 28,
    height: 28,
    textAlign: "center",
    lineHeight: 28,
    borderRadius: 14,
  },
  stepText: { color: "#cbd5e1", fontSize: 14, flex: 1 },
});
