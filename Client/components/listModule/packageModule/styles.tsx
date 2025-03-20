import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      height: 87,
      borderRadius: 10,
      backgroundColor: theme.color.white,
      ...theme.shadow,
      elevation: 5,
    },
    title: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
    },
  });
}

