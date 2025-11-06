import { StyleSheet, View } from "react-native";
import CategoriesGridTile from "../components/ui/CategoriesGridTile";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function App() {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: "Categories" });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <CategoriesGridTile />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
