import { StyleSheet } from "react-native";
import { useTheme } from "@context/ThemeContext";

export default function useStyles() {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      width: "100%",
      minHeight: 90,
      borderRadius: 10,
      backgroundColor: theme.color.white,
      ...theme.shadow,
      elevation: 5,
      padding: 20,
      borderColor: "#D3D3D3",
      borderWidth: 0.2,
      gap: 5,
      flexDirection: "row",
    },
    title: {
      fontSize: theme.fontSize.large,
      fontFamily: theme.font.semibold,
      flex: 1,
    },
    firstRow: {
      flexDirection: "row",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 20,
      alignSelf: "flex-start",
    },
    phoneNumber: {
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
    },
    secondRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 20,
    },
    trashIcon: {
      bottom: -5,
    },
    location: {
      flex: 1,
      fontSize: theme.fontSize.medium,
      fontFamily: theme.font.regular,
    },
    trashOuter: {
      justifyContent: "flex-end",
    },
    phoneNumberOuter: {
      justifyContent: "flex-start",
      height: "100%",
    },
    secondColumn: {
      flex: 1,
      justifyContent: "center",
      gap: 3,
    },
    firstColumn: {
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
  });
}

