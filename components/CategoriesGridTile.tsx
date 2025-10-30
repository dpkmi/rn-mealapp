import {
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../src/ui/theme";
import { useMealsStore } from "../src/stores/useMealsStore";
import { useShallow } from "zustand/react/shallow";
import type { Category } from "../src/db/types";
import { useEffect } from "react";

const CategoriesGridTile = () => {
  const theme = useTheme();

  const { categories, loadingCategories, error, loadCategories } =
    useMealsStore(
      useShallow((s) => ({
        categories: s.categories,
        loadingCategories: s.loadingCategories,
        error: s.error,
        loadCategories: s.loadCategories,
      }))
    );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const listKey = `list-${Math.random().toString(36)}`;

  const renderItem: ListRenderItem<Category> = ({ item }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Pressable
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          android_ripple={{ color: "#ccc" }}
          onPress={() => {
            console.log("Pressed", item.title);
          }}
        >
          <Text>{item.title}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={{ gap: theme.spacing.md, flex: 1 }}>
      <Text style={{ fontSize: theme.fontsize.lg }}>Categories</Text>
      <View style={{ flex: 1, flexDirection: "row", width: "100%" }}>
        <FlatList
          key={listKey}
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ItemSeparatorComponent={() => (
            <View style={{ height: theme.spacing.md }} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    marginHorizontal: 5,
    width: "47%",
    height: 150,
  },
});

export default CategoriesGridTile;
