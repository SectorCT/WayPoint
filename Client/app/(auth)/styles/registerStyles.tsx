import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: theme.color.white,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: theme.color.black,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.color.lightPrimary,
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
      backgroundColor: theme.color.white,
    },
    linkText: {
      color: theme.color.black,
      textAlign: "center",
      marginTop: 15,
    },
    linkAction: {
      color: theme.color.darkPrimary,
      fontWeight: "600",
    },
  });
}
