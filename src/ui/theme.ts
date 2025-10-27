import { useColorScheme } from "react-native";
import { fontsize, palette, radius, spacing, type } from "./tokens";

export function useTheme() {
  const colorScheme = useColorScheme();

  const dark = colorScheme === "dark";

  return {
    dark,
    colors: {
      bg: dark ? palette.bgDark : palette.bg,
      text: dark ? palette.text : palette.textDark,
      primary: dark ? palette.primaryDark : palette.primary,
      border: dark ? palette.borderDark : palette.border,
    },
    spacing,
    radius,
    type,
    fontsize,
    shadow: {
      card: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        shadowOffset: {
          width: 0,
          height: 4,
        },
      },
    },
  };
}
