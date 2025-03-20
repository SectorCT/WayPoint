import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    buttonContainer: {
      width: "100%",
      borderRadius: 8,
      overflow: "hidden",
      elevation: 3,
      ...theme.shadow,
    },
    gradient: {
      padding: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      color: theme.color.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });
}
