import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../src/ui/theme";
import CategoriesGridTile from "../components/CategoriesGridTile";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
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
