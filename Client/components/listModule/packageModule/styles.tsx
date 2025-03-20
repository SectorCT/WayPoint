import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      height: 90,
      borderRadius: 10,
      backgroundColor: theme.color.white,
      ...theme.shadow,
      elevation: 5,
      padding: 20,
      justifyContent: "space-between",
      borderColor: "#D3D3D3",
      borderWidth: 0.2,
    },
    title: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
    },
    firstRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
    },
    phoneNumber: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
    },
    secondRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    trashIcon: {
      bottom: -5,
    },
  });
}
