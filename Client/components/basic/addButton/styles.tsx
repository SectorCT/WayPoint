import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      backgroundColor: theme.color.lightPrimary,
      aspectRatio: 1,
      width: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
    },
  });
}
