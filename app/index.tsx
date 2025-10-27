import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../src/ui/theme";
import Categories from "../components/categories";

export default function App() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Categories />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
