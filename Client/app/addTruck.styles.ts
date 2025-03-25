import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#FFFFFF",
    },
    headerContainer: {
      marginTop: 20,
      marginBottom: 32,
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 16,
      lineHeight: 24,
    },
    buttonContainer: {
      marginTop: 16,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    formContainer: {
      flex: 1,
    },
  });
} 