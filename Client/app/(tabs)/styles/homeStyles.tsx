import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
    },
    text: {
      fontSize: 24,
      marginBottom: 20,
    },
    button: {
      backgroundColor: "#FF3B30",
      padding: 15,
      borderRadius: 5,
      width: 200,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}
