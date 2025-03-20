import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      paddingTop: 50,
      backgroundColor: "#FFFFFF",
    },
    headerContainer: {
      marginTop: 20,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 39,
      fontFamily: theme.font.medium,
      marginBottom: 8,
    },
  });
}
