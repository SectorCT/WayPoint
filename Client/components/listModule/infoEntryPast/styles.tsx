import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      borderRadius: 12,
      padding: 12,
    },
    containerInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    firstColumn: {
      justifyContent: "center",
      alignItems: "center",
    },
    secondColumn: {
      flex: 1,
      justifyContent: "center",
    },
    value: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
      color: theme.color.black,
    },
  });
}

