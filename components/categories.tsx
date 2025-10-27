import { FlatList, ListRenderItem, StyleSheet, Text, View } from "react-native";
import { CATEGORIES } from "../data/dummy-data";
import { useTheme } from "../src/ui/theme";

const Categories = () => {
  const theme = useTheme();
  const getCategories = CATEGORIES;
  const listKey = `list-${Math.random().toString(36).substr(2, 9)}`;

  const renderItem: ListRenderItem<(typeof getCategories)[number]> = ({
    item,
  }) => {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Text
          style={{
            color: theme.colors.text,
            fontSize: theme.fontsize.md,
            marginBottom: theme.spacing.md,
          }}
        >
          {item.title}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ gap: theme.spacing.md, flex: 1 }}>
      <Text style={{ fontSize: theme.fontsize.lg }}>Categories</Text>
      <View style={{ flex: 1, flexDirection: "row", width: "100%" }}>
        <FlatList
          key={listKey}
          data={getCategories}
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
    margin: 5,
    width: "48%",
    height: 150,
  },
});

export default Categories;
